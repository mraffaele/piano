import React, { useState, useCallback, useMemo } from "react";
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
  const [pressedNotes, setPressedNotes] = useState<Set<string>>(new Set());
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
    (note: string, velocity: number) => {
      const frequency = NOTE_FREQUENCIES[note];
      if (frequency) {
        playNote(note, frequency, velocity);
        setPressedNotes((prev) => new Set(prev).add(note));

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
      setPressedNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
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
      setPressedNotes((prev) => new Set(prev).add(note));
    },
    [playbackPlayNote],
  );

  const handlePlaybackNoteEnd = useCallback(
    (note: string) => {
      playbackStopNote(note);
      setPressedNotes((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    },
    [playbackStopNote],
  );

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
      setPressedNotes(new Set());
    }
  }, [recorderState, stopRecording, stopPlayback]);

  const handleStopPlayback = useCallback(() => {
    stopPlayback();
    setPressedNotes(new Set());
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
      {/*       
      <SoundSelector
        currentSound={soundType}
        onSoundChange={setSoundType}
      /> */}

      <div className="piano-container" {...touchHandlers}>
        <div className="piano">
          {/* White keys */}
          {whiteKeys.map((noteInfo) => (
            <Key
              key={noteInfo.note}
              note={noteInfo.note}
              isBlack={false}
              isPressed={pressedNotes.has(noteInfo.note)}
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
                isPressed={pressedNotes.has(noteInfo.note)}
                {...mouseHandlers}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
