import React, { useState, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { Key } from "./Key";
import { FallingNote } from "./FallingNote";
import { RecordingControls } from "./RecordingControls";
import { TrackList } from "./TrackList";
import { usePianoSynth } from "../hooks/usePianoSynth";
import { useTouchHandler } from "../hooks/useTouchHandler";
import { useRecorder } from "../hooks/useRecorder";
import { useFallingNotes } from "../hooks/useFallingNotes";
import { PIANO_NOTES, NOTE_FREQUENCIES } from "../utils/noteFrequencies";
import "./Piano.css";

// Black key positions relative to white keys (percentage offset)
const BLACK_KEY_OFFSETS: Record<string, number> = {
  "C#": 1,
  "D#": 2,
  "F#": 4,
  "G#": 5,
  "A#": 6,
};

interface PracticeVisualDetail {
  note: string;
  fallMs?: number;
  durationMs?: number;
}

interface PracticePlayDetail {
  note: string;
  freq?: number;
  vel?: number;
  muted?: boolean;
}

interface PracticeStopDetail {
  note: string;
  muted?: boolean;
}

/** Increment the press count for a note (user or playback pressed a key). */
const incrementPressed = (
  prev: Record<string, number>,
  note: string,
): Record<string, number> => {
  const next = { ...prev };
  next[note] = (next[note] || 0) + 1;
  return next;
};

/** Decrement the press count for a note, removing the entry when it hits 0. */
const decrementPressed = (
  prev: Record<string, number>,
  note: string,
): Record<string, number> => {
  const next = { ...prev };
  const current = next[note] || 0;
  if (current <= 1) {
    delete next[note];
  } else {
    next[note] = current - 1;
  }
  return next;
};

export const Piano: React.FC = () => {
  // Map of key note -> DOM element for aligning falling notes
  const keyRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const registerKeyRef = React.useCallback(
    (note: string, el: HTMLElement | null) => {
      keyRefs.current[note] = el;
    },
    [],
  );

  // Falling notes overlay container ref
  const fallingContainerRef = React.useRef<HTMLDivElement | null>(null);

  // React-driven falling notes state
  const { fallingNotes, addFallingNote, clearAll } = useFallingNotes();

  // Listen for practice visual events to spawn falling notes
  React.useEffect(() => {
    const onVisualStart = (e: CustomEvent<PracticeVisualDetail>) => {
      const { note, fallMs, durationMs } = e.detail;
      if (!note) return;
      const keyEl = keyRefs.current[note];
      const container = fallingContainerRef.current;
      if (!keyEl || !container) return;
      const keyRect = keyEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      addFallingNote(
        note,
        keyRect,
        containerRect,
        containerRect.height,
        fallMs ?? 1200,
        durationMs,
      );
    };

    const onPracticeClear = () => {
      clearAll();
    };

    window.addEventListener(
      "practice:visualStart",
      onVisualStart as EventListener,
    );
    window.addEventListener("practice:clear", onPracticeClear as EventListener);
    return () => {
      window.removeEventListener(
        "practice:visualStart",
        onVisualStart as EventListener,
      );
      window.removeEventListener(
        "practice:clear",
        onPracticeClear as EventListener,
      );
    };
  }, [addFallingNote, clearAll]);
  // Track active play counts per note so overlapping plays of the same
  // note don't prematurely clear the visual state when one instance stops.
  const [pressedCounts, setPressedCounts] = useState<Record<string, number>>(
    {},
  );
  const [soundType, _setSoundType] = useState<string>("piano");
  const [playbackSoundType, setPlaybackSoundType] = useState<string>("piano");

  // Main synth for live playing (uses current soundType)
  const { playNote, stopNote } = usePianoSynth(soundType);
  // Separate synth for playback (uses track's soundType)
  const { playNote: playbackPlayNote, stopNote: playbackStopNote } =
    usePianoSynth(playbackSoundType);
  const {
    state: recorderState,
    hasCurrentRecording,
    tracks,
    activeTrackId,
    startRecording,
    stopRecording,
    saveTrack,
    deleteTrack,
    renameTrack,
    playTrack,
    stopPlayback,
    recordNoteStart,
    recordNoteEnd,
    clearCurrentRecording,
  } = useRecorder();

  const handleNoteStart = useCallback(
    async (note: string, velocity: number) => {
      const frequency = NOTE_FREQUENCIES[note];
      if (frequency) {
        // Ensure audio context resumes within the user gesture by awaiting playNote
        await playNote(note, frequency, velocity);
        setPressedCounts((prev) => incrementPressed(prev, note));

        // Record the note if recording
        recordNoteStart(note, frequency, velocity);
      }
    },
    [playNote, recordNoteStart],
  );

  const handleNoteEnd = useCallback(
    (note: string) => {
      const frequency = NOTE_FREQUENCIES[note];
      stopNote(note);
      setPressedCounts((prev) => decrementPressed(prev, note));

      // Record the note end if recording
      if (frequency) {
        recordNoteEnd(note, frequency);
      }
    },
    [stopNote, recordNoteEnd],
  );

  // Playback note handlers that also update visual state
  const handlePlaybackNoteStart = useCallback(
    (note: string, frequency: number, velocity: number) => {
      playbackPlayNote(note, frequency, velocity);
      setPressedCounts((prev) => incrementPressed(prev, note));
    },
    [playbackPlayNote],
  );

  const handlePlaybackNoteEnd = useCallback(
    (note: string) => {
      playbackStopNote(note);
      // Ensure the visual release is rendered immediately so rapid
      // stop->play sequences (like in Practice playback) show a brief
      // release between notes instead of being batched together.
      flushSync(() => {
        setPressedCounts((prev) => decrementPressed(prev, note));
      });
    },
    [playbackStopNote],
  );

  // Listen for practice panel play/stop events and forward to playback handlers
  React.useEffect(() => {
    const onPracticePlay = (e: CustomEvent<PracticePlayDetail>) => {
      const { note, freq, vel, muted } = e.detail;
      if (!note) return;

      // When practice playback triggers a note, we want the falling-note
      // visuals but we DO NOT want to show the key "pressed" active state.
      // The pressedCounts state is used for visual key highlighting when the
      // user physically presses keys; avoid updating it for practice playback.

      // Only trigger audio when not muted.
      if (freq && !muted) {
        playbackPlayNote(note, freq, vel ?? 0.8);
      }
    };

    const onPracticeStop = (e: CustomEvent<PracticeStopDetail>) => {
      const { note, muted } = e.detail;
      if (!note) return;

      // For practice playback we do not update pressedCounts so the key
      // active state is not shown. We still stop audio when appropriate.

      // Stop audio only when not muted
      if (!muted) {
        playbackStopNote(note);
      }
    };

    window.addEventListener("practice:play", onPracticePlay as EventListener);
    window.addEventListener("practice:stop", onPracticeStop as EventListener);
    return () => {
      window.removeEventListener(
        "practice:play",
        onPracticePlay as EventListener,
      );
      window.removeEventListener(
        "practice:stop",
        onPracticeStop as EventListener,
      );
    };
  }, [playbackPlayNote, playbackStopNote]);

  const handlePlayTrack = useCallback(
    (id: string) => {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        // Set the playback sound type to match the track's recorded sound
        setPlaybackSoundType(track.soundType || "piano");
        // Small delay to ensure the synth updates before playback starts
        setTimeout(() => {
          playTrack(id, handlePlaybackNoteStart, handlePlaybackNoteEnd);
        }, 10);
      }
    },
    [playTrack, handlePlaybackNoteStart, handlePlaybackNoteEnd, tracks],
  );

  const handleStop = useCallback(() => {
    if (recorderState === "recording") {
      stopRecording();
    } else if (recorderState === "playing") {
      stopPlayback();
      // Clear any pressed notes when stopping playback
      setPressedCounts({});
    }
  }, [recorderState, stopRecording, stopPlayback]);

  const handleStopPlayback = useCallback(() => {
    stopPlayback();
    setPressedCounts({});
  }, [stopPlayback]);

  const handleSaveTrack = useCallback(() => {
    saveTrack(undefined, soundType);
  }, [saveTrack, soundType]);

  const { touchHandlers, mouseHandlers } = useTouchHandler({
    onNoteStart: handleNoteStart,
    onNoteEnd: handleNoteEnd,
  });

  // Separate white and black keys
  const { whiteKeys, blackKeys } = useMemo(() => {
    const white = PIANO_NOTES.filter((n) => !n.isBlack);
    const black = PIANO_NOTES.filter((n) => n.isBlack);
    return { whiteKeys: white, blackKeys: black };
  }, []);

  // Calculate black key positions
  const getBlackKeyPosition = (note: string) => {
    const noteName = note.replace(/\d+$/, "");
    const octave = parseInt(note.match(/\d+$/)?.[0] || "4", 10);
    const octaveOffset = (octave - 4) * 7; // 7 white keys per octave
    const noteOffset = BLACK_KEY_OFFSETS[noteName] || 0;

    // Each white key is (100 / 15)% wide (15 white keys total)
    const whiteKeyWidth = 100 / 15;
    const position =
      (octaveOffset + noteOffset) * whiteKeyWidth - whiteKeyWidth * 0.35;

    return position;
  };

  return (
    <>
      <RecordingControls
        state={recorderState}
        hasCurrentRecording={hasCurrentRecording}
        onRecord={startRecording}
        onStop={handleStop}
        onSave={handleSaveTrack}
        onClear={clearCurrentRecording}
      />

      <TrackList
        tracks={tracks}
        activeTrackId={activeTrackId}
        isPlaying={recorderState === "playing"}
        onPlay={handlePlayTrack}
        onStop={handleStopPlayback}
        onDelete={deleteTrack}
        onRename={renameTrack}
      />

      <div className="piano-container" {...touchHandlers}>
        {/* Overlay for falling notes: positioned absolute to cover the piano area */}
        <div ref={fallingContainerRef} className="falling-notes-overlay">
          {fallingNotes.map((note) => (
            <FallingNote key={note.id} state={note} />
          ))}
        </div>
        <div className="piano">
          {/* White keys */}
          {whiteKeys.map((noteInfo) => (
            <Key
              key={noteInfo.note}
              note={noteInfo.note}
              isBlack={false}
              isPressed={Boolean(pressedCounts[noteInfo.note])}
              registerKeyRef={registerKeyRef}
              {...mouseHandlers}
            />
          ))}

          {/* Black keys - positioned absolutely */}
          {blackKeys.map((noteInfo) => (
            <div
              key={noteInfo.note}
              className="black-key-container"
              style={{
                left: `${getBlackKeyPosition(noteInfo.note)}%`,
              }}
            >
              <Key
                note={noteInfo.note}
                isBlack={true}
                isPressed={Boolean(pressedCounts[noteInfo.note])}
                registerKeyRef={registerKeyRef}
                {...mouseHandlers}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
