import React, { useState, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { Key } from "./Key";
import { RecordingControls } from "./RecordingControls";
import { TrackList } from "./TrackList";
import { SoundSelector } from "./SoundSelector";
import { usePianoSynth } from "../hooks/usePianoSynth";
import { useTouchHandler } from "../hooks/useTouchHandler";
import { useRecorder } from "../hooks/useRecorder";
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

export const Piano: React.FC = () => {
  // Map of key note -> DOM element for aligning falling notes
  const keyRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const registerKeyRef = React.useCallback((note: string, el: HTMLElement | null) => {
    keyRefs.current[note] = el;
  }, []);

  // Falling notes overlay container ref
  const fallingContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Create and animate a falling note element that lands on the target key
  // durationMs: note duration in milliseconds, used to scale the visual height
  const createAndAnimateFallingNote = React.useCallback((_note: string, targetRect: DOMRect, fallMs: number, durationMs?: number) => {
    const container = fallingContainerRef.current;
    if (!container) return;

    const el = document.createElement('div');
    el.className = 'falling-note';
    // Visual indicator: larger circular dot (no text)
    el.style.position = 'absolute';
    const NOTE_SIZE = 44; // px - minimum width
    const HEIGHT_PER_SECOND = 44; // px per second of duration
    
    // Calculate variable height based on duration
    // Minimum 44px, scales linearly with duration
    const noteHeight = durationMs 
      ? Math.max(NOTE_SIZE, (durationMs / 1000) * HEIGHT_PER_SECOND)
      : NOTE_SIZE;
    
    el.style.width = `${NOTE_SIZE}px`;
    el.style.height = `${noteHeight}px`;
    // Keep circular for minimum size, rounded rectangle for taller notes
    el.style.borderRadius = noteHeight === NOTE_SIZE ? '50%' : '12px';
    el.style.background = 'linear-gradient(180deg, #ffefc2 0%, #ffcf5c 100%)';
    el.style.boxShadow = '0 10px 30px rgba(255, 150, 0, 0.28), 0 2px 6px rgba(0,0,0,0.25)';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontWeight = '700';
    el.style.color = '#111';
    // Position relative to container
    const containerRect = container.getBoundingClientRect();
    const startTop = -60; // starting top inside container
    const startLeft = targetRect.left + targetRect.width / 2 - containerRect.left;
    el.style.left = `${startLeft}px`;
    el.style.top = `${startTop}px`;
    el.style.transform = 'translate(-50%, 0)';
    el.style.willChange = 'transform, top';
    container.appendChild(el);

    // compute landing zone and final Y inside the container so the note
    // lands dead center of the landing zone. Zone is fixed height to indicate
    // when to start pressing; falling note height indicates duration.
    const ZONE_HEIGHT = 44; // fixed height, matches NOTE_SIZE
    const zoneCenter = targetRect.top - containerRect.top + targetRect.height * 0.88;
    const zoneTop = zoneCenter - ZONE_HEIGHT / 2;
    const endTop = zoneCenter - noteHeight / 2; // dot's top so its center is zoneCenter
    const deltaY = endTop - startTop;

    // Create a landing zone overlay at the target key so users can see
    // where the note will land. Zone is fixed height to indicate when to press.
    const zone = document.createElement('div');
    zone.className = 'landing-zone';
    zone.style.position = 'absolute';
    // Landing zone is fixed height to indicate when to start pressing
    const zoneWidth = Math.max(64, targetRect.width * 1.05);
    zone.style.width = `${zoneWidth}px`;
    zone.style.height = `${ZONE_HEIGHT}px`;
    const zoneLeft = targetRect.left + targetRect.width / 2 - containerRect.left - zoneWidth / 2;
    zone.style.left = `${zoneLeft}px`;
    zone.style.top = `${zoneTop}px`;
    zone.style.pointerEvents = 'none';
    zone.style.display = 'flex';
    zone.style.alignItems = 'center';
    zone.style.justifyContent = 'center';
    container.appendChild(zone);

    // Animate the falling note from its start position down to the landing
    // zone using a linear timing so the landing time matches audio.
    const anim = el.animate([
      { transform: `translate(-50%, 0px)`, opacity: 1 },
      { transform: `translate(-50%, ${deltaY}px)`, opacity: 1 },
    ], { duration: Math.max(0, fallMs), easing: 'linear' });

    anim.onfinish = () => {
       // landing bounce for the falling note
       const bounceDistance = Math.max(4, noteHeight * 0.15); // bounce proportional to height
       el.animate([
         { transform: `translate(-50%, ${deltaY}px)` },
         { transform: `translate(-50%, ${deltaY - bounceDistance}px)` },
         { transform: `translate(-50%, ${deltaY}px)` },
       ], { duration: 220, easing: 'cubic-bezier(.2,.8,.3,1)' });

      // Pulse the landing zone to make the landing point obvious
      zone.animate([
        { transform: 'scale(1)', opacity: 0.85 },
        { transform: 'scale(1.08)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0.6 },
      ], { duration: 300, easing: 'ease-out' });

      setTimeout(() => { el.remove(); }, 500);
      setTimeout(() => { zone.remove(); }, 700);
    };

    // cleanup if needed after a max time
    setTimeout(() => { if (el.parentElement) el.remove(); if (zone.parentElement) zone.remove(); }, fallMs + 4000);
  }, []);

  // Listen for practice visual events to spawn falling notes
  React.useEffect(() => {
    const onVisualStart = (e: any) => {
      const { note, fallMs, durationMs } = e.detail || {};
      if (!note) return;
      const keyEl = keyRefs.current[note];
      const container = fallingContainerRef.current;
      if (!keyEl || !container) return;
      const keyRect = keyEl.getBoundingClientRect();
      createAndAnimateFallingNote(note, keyRect, fallMs ?? 1200, durationMs);
    };
    window.addEventListener('practice:visualStart', onVisualStart as EventListener);
    return () => window.removeEventListener('practice:visualStart', onVisualStart as EventListener);
  }, [createAndAnimateFallingNote]);
  // Track active play counts per note so overlapping plays of the same
  // note don't prematurely clear the visual state when one instance stops.
  const [pressedCounts, setPressedCounts] = useState<Record<string, number>>({});
  const [soundType, setSoundType] = useState<string>("piano");
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
        setPressedCounts((prev) => {
          const next = { ...prev };
          next[note] = (next[note] || 0) + 1;
          return next;
        });

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
      setPressedCounts((prev) => {
        const next = { ...prev };
        const current = next[note] || 0;
        if (current <= 1) {
          delete next[note];
        } else {
          next[note] = current - 1;
        }
        return next;
      });

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
      setPressedCounts((prev) => {
        const next = { ...prev };
        next[note] = (next[note] || 0) + 1;
        return next;
      });
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
        setPressedCounts((prev) => {
          const next = { ...prev };
          const current = next[note] || 0;
          if (current <= 1) {
            delete next[note];
          } else {
            next[note] = current - 1;
          }
          return next;
        });
      });
    },
    [playbackStopNote],
  );

  // Listen for practice panel play/stop events and forward to playback handlers
  React.useEffect(() => {
    const onPracticePlay = (e: any) => {
      const { note, freq, vel, muted } = e.detail || {};
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

    const onPracticeStop = (e: any) => {
      const { note, muted } = e.detail || {};
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
      window.removeEventListener("practice:play", onPracticePlay as EventListener);
      window.removeEventListener("practice:stop", onPracticeStop as EventListener);
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
  const getBlackKeyPosition = (note: string, _index: number) => {
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

      <SoundSelector currentSound={soundType} onSoundChange={setSoundType} />

      <div className="piano-container" {...touchHandlers}>
        {/* Overlay for falling notes: positioned absolute to cover the piano area */}
        <div ref={fallingContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50 }} />
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
          {blackKeys.map((noteInfo, index) => (
            <div
              key={noteInfo.note}
              className="black-key-container"
              style={{
                left: `${getBlackKeyPosition(noteInfo.note, index)}%`,
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
