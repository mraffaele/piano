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

      events.forEach((e: Song["events"][0]) => {
        const whenMs = e.time * beatSecondsLocal * 1000;
        const playId = window.setTimeout(() => {
          const freq = NOTE_FREQUENCIES[e.note];
          // dispatch a global event so Piano (sibling) can listen and play notes
          window.dispatchEvent(
            new CustomEvent("practice:play", {
              detail: { note: e.note, freq, vel: 0.8 },
            }),
          );

          // also call local callback if provided (backwards compatible)
          if (onPlayNote && freq) onPlayNote(e.note, freq, 0.8);
        }, whenMs);
        timeoutsRef.current.push(playId);

        const stopId = window.setTimeout(
          () => {
            // notify listeners that this note stopped
            window.dispatchEvent(
              new CustomEvent("practice:stop", {
                detail: { note: e.note },
              }),
            );

            if (onStopNote) onStopNote(e.note);
          },
          whenMs + e.dur * beatSecondsLocal * 1000,
        );
        timeoutsRef.current.push(stopId);
      });

      // End of sequence
      const totalBeats = Math.max(
        ...events.map((ev: Song["events"][0]) => ev.time + ev.dur),
      );
      const endMs = totalBeats * beatSecondsLocal * 1000;
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
        new CustomEvent("practice:stop", { detail: { note: e.note } }),
      );
      if (onStopNote) onStopNote(e.note);
    });
  };

  return (
    <div className="practice-panel">
      <div className="practice-header">
        <select
          className="practice-song-select"
          value={selectedSongId}
          onChange={(e) => {
            // stop current playback when switching songs
            if (playing) stop();
            setSelectedSongId(e.target.value);
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
            onChange={(e) => setLoop(e.target.checked)}
          />{" "}
          Loop
        </label>
      </div>

      {/* Notes view removed per request */}
    </div>
  );
};

export default PracticePanel;
