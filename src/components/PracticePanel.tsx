import React, { useState, useRef } from "react";
import { NOTE_FREQUENCIES } from "../utils/noteFrequencies";
import SONGS, { Song } from "../data/songs";
import "./PracticePanel.css";

interface Props {
  // optional callbacks for direct playback (keeps backwards compatibility)
  onPlayNote?: (note: string, frequency: number, velocity: number) => void;
  onStopNote?: (note: string) => void;
}

// Song data is loaded from src/data/songs

export const PracticePanel: React.FC<Props> = ({ onPlayNote, onStopNote }) => {
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [muted, setMuted] = useState(true);
  const [selectedSongId, setSelectedSongId] = useState<string>(
    SONGS[0]?.id ?? "",
  );
  const timeoutsRef = useRef<number[]>([]);

  const clearScheduled = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const play = () => {
    if (playing) return;
    setPlaying(true);

    const schedule = () => {
      const song = SONGS.find((s) => s.id === selectedSongId) || SONGS[0];
      const events: Song["events"] = song.events;
      const tempo = song.tempo;
      // recompute beatSeconds in case tempo differs per song
      const beatSecondsLocal = 60 / tempo;
      const FALL_MS = 1800; // visual fall duration in ms
      const START_DELAY_MS = 1800; // give animations a short lead-in so first note doesn't rush

       events.forEach((e: Song["events"][0]) => {
         const whenMs = e.time * beatSecondsLocal * 1000 + START_DELAY_MS;
         // schedule visual start so the falling note has time to animate and
         // land at the play time. If the note is too close, shorten duration.
         const visualDuration = Math.min(FALL_MS, whenMs);
         const visualStartMs = Math.max(0, whenMs - visualDuration);
         // Calculate note duration in milliseconds for the falling note height
         const noteDurationMs = e.dur * beatSecondsLocal * 1000;
         const visualId = window.setTimeout(() => {
           window.dispatchEvent(
             new CustomEvent("practice:visualStart", {
               detail: { note: e.note, fallMs: visualDuration, durationMs: noteDurationMs },
             }),
           );
         }, visualStartMs);
        timeoutsRef.current.push(visualId);
        const playId = window.setTimeout(() => {
          const freq = NOTE_FREQUENCIES[e.note];
          // dispatch a global event so Piano (sibling) can listen and play notes
          window.dispatchEvent(
            new CustomEvent("practice:play", {
              detail: { note: e.note, freq, vel: 0.8, muted },
            }),
          );

          // also call local callback if provided (backwards compatible)
          if (onPlayNote && freq) onPlayNote(e.note, freq, 0.8);
        }, whenMs);
        timeoutsRef.current.push(playId);

        // small visual gap to ensure a brief release between identical
        // consecutive notes. Subtract a few milliseconds from the stop
        // timeout so the visual "stop" fires slightly before the next
        // "play" when notes repeat. Keep it small to avoid audible
        // artifacts.
        // Increased gap to make the visual release more noticeable for
        // repeated identical notes. Adjust if needed (10-120ms range).
        const VISUAL_GAP_MS = 60;
        const stopTime = Math.max(
          0,
          whenMs + e.dur * beatSecondsLocal * 1000 - VISUAL_GAP_MS,
        );

        const stopId = window.setTimeout(() => {
          // notify listeners that this note stopped
          window.dispatchEvent(
            new CustomEvent("practice:stop", {
              detail: { note: e.note, muted },
            }),
          );

          if (onStopNote) onStopNote(e.note);
        }, stopTime);
        timeoutsRef.current.push(stopId);
      });

      // End of sequence
      const totalBeats = Math.max(
        ...events.map((ev: Song["events"][0]) => ev.time + ev.dur),
      );
      const endMs = totalBeats * beatSecondsLocal * 1000 + START_DELAY_MS;
      const endId = window.setTimeout(() => {
        if (loop) {
          clearScheduled();
          schedule();
        } else {
          setPlaying(false);
        }
      }, endMs + 20);
      timeoutsRef.current.push(endId);
    };

    schedule();
  };

  const stop = () => {
    clearScheduled();
    setPlaying(false);
    // ensure any sounding notes are stopped
    const song = SONGS.find((s) => s.id === selectedSongId) || SONGS[0];
    const events: Song["events"] = song.events;
    events.forEach((e: Song["events"][0]) => {
      window.dispatchEvent(
        new CustomEvent("practice:stop", { detail: { note: e.note, muted } }),
      );
      if (onStopNote) onStopNote(e.note);
    });
  };

  return (
    <div className="practice-panel">
      <div className="practice-header">
        <strong>Practice:</strong>
        <select
          className="practice-song-select"
          value={selectedSongId}
          onChange={(e) => {
            // If currently playing, stop and immediately restart with the
            // newly selected song so the change takes effect right away.
            const newId = e.target.value;
            if (playing) {
              stop();
              setSelectedSongId(newId);
              // small timeout to ensure stop takes effect before scheduling
              setTimeout(() => play(), 10);
            } else {
              setSelectedSongId(newId);
            }
          }}
          style={{ marginLeft: 8 }}
        >
          {SONGS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <div className="practice-controls">
          <button
            onClick={() => {
              if (playing) stop();
              else play();
            }}
          >
            {playing ? "Stop" : "Play"}
          </button>
        </div>

        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => {
              const newVal = e.target.checked;
              // If playing, restart immediately with new loop mode applied.
              if (playing) {
                stop();
                setLoop(newVal);
                setTimeout(() => play(), 10);
              } else {
                setLoop(newVal);
              }
            }}
          />{" "}
          Loop
        </label>

        <label>
          <input
            type="checkbox"
            checked={muted}
            onChange={(e) => {
              const newVal = e.target.checked;
              // If playing, restart immediately so mute state applies without
              // requiring the user to press Play again.
              if (playing) {
                stop();
                setMuted(newVal);
                setTimeout(() => play(), 10);
              } else {
                setMuted(newVal);
              }
            }}
          />{" "}
          No sound
        </label>

        {/* Falling notes always shown in practice mode; toggle removed */}
      </div>

      {/* Notes view removed per request */}
    </div>
  );
};

export default PracticePanel;
