import React, { useState, useRef } from "react";
import { NOTE_FREQUENCIES } from "../utils/noteFrequencies";
import "./PracticePanel.css";

interface Props {
  // optional callbacks for direct playback (keeps backwards compatibility)
  onPlayNote?: (note: string, frequency: number, velocity: number) => void;
  onStopNote?: (note: string) => void;
}

// Simple Twinkle Twinkle melody encoded in beats (quarter = 1 beat)
const TWINKLE = {
  id: "twinkle",
  title: "Twinkle Twinkle",
  tempo: 80, // bpm
  events: [
    // bar 1
    { time: 0, note: "C4", dur: 1 },
    { time: 1, note: "C4", dur: 1 },
    { time: 2, note: "G4", dur: 1 },
    { time: 3, note: "G4", dur: 1 },
    // bar 2
    { time: 4, note: "A4", dur: 1 },
    { time: 5, note: "A4", dur: 1 },
    { time: 6, note: "G4", dur: 2 },
    // bar 3
    { time: 8, note: "F4", dur: 1 },
    { time: 9, note: "F4", dur: 1 },
    { time: 10, note: "E4", dur: 1 },
    { time: 11, note: "E4", dur: 1 },
    // bar 4
    { time: 12, note: "D4", dur: 1 },
    { time: 13, note: "D4", dur: 1 },
    { time: 14, note: "C4", dur: 2 },

    // repeat (second phrase)
    { time: 16, note: "C4", dur: 1 },
    { time: 17, note: "C4", dur: 1 },
    { time: 18, note: "G4", dur: 1 },
    { time: 19, note: "G4", dur: 1 },
    { time: 20, note: "A4", dur: 1 },
    { time: 21, note: "A4", dur: 1 },
    { time: 22, note: "G4", dur: 2 },
    { time: 24, note: "F4", dur: 1 },
    { time: 25, note: "F4", dur: 1 },
    { time: 26, note: "E4", dur: 1 },
    { time: 27, note: "E4", dur: 1 },
    { time: 28, note: "D4", dur: 1 },
    { time: 29, note: "D4", dur: 1 },
    { time: 30, note: "C4", dur: 2 },
  ],
};

export const PracticePanel: React.FC<Props> = ({ onPlayNote, onStopNote }) => {
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const timeoutsRef = useRef<number[]>([]);

  const clearScheduled = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  };

  const play = () => {
    if (playing) return;
    setPlaying(true);
    const beatSeconds = 60 / TWINKLE.tempo;

    const schedule = () => {
      TWINKLE.events.forEach((e) => {
        const whenMs = e.time * beatSeconds * 1000;
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
          whenMs + e.dur * beatSeconds * 1000,
        );
        timeoutsRef.current.push(stopId);
      });

      // End of sequence
      const totalBeats = Math.max(
        ...TWINKLE.events.map((ev) => ev.time + ev.dur),
      );
      const endMs = totalBeats * beatSeconds * 1000;
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
    TWINKLE.events.forEach((e) => {
      window.dispatchEvent(
        new CustomEvent("practice:stop", { detail: { note: e.note } }),
      );
      if (onStopNote) onStopNote(e.note);
    });
  };

  return (
    <div className="practice-panel">
      <div className="practice-header">
        <strong>{TWINKLE.title}</strong>
        <div className="practice-controls">
          <button onClick={play} disabled={playing}>
            Play
          </button>
          <button onClick={stop} disabled={!playing}>
            Stop
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
