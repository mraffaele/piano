import React from "react";
import type { FallingNoteState } from "../hooks/useFallingNotes";
import "./FallingNote.css";

const NOTE_SIZE = 44;
const ZONE_HEIGHT = 44;

interface FallingNoteProps {
  state: FallingNoteState;
}

/**
 * Renders a single falling note element and its landing zone.
 * All animation is driven by CSS classes based on `state.stage`.
 * Accuracy feedback is shown as an overlay when the user hits the note.
 * Only per-instance dynamic values (position, size, timing) are inline;
 * everything else lives in FallingNote.css.
 */
export const FallingNote: React.FC<FallingNoteProps> = React.memo(
  ({ state }) => {
    const {
      stage,
      noteHeight,
      startTop,
      leftPx,
      deltaY,
      bounceDistance,
      exitDistance,
      fallMs,
      showZone,
      zoneLeftPx,
      zoneTopPx,
      zoneWidth,
      accuracy,
    } = state;

    const shapeClass =
      noteHeight === NOTE_SIZE ? "falling-note--circle" : "falling-note--rect";

    return (
      <>
        <div
          className={`falling-note ${shapeClass} falling-note--${stage}`}
          style={{
            width: NOTE_SIZE,
            height: noteHeight,
            left: leftPx,
            top: startTop,
            "--delta-y": `${deltaY}px`,
            "--bounce-distance": `${bounceDistance}px`,
            "--exit-distance": `${exitDistance}px`,
            "--fall-ms": `${fallMs}ms`,
          } as React.CSSProperties}
        />
        {showZone && (
          <div
            className={`landing-zone ${stage === "bouncing" || stage === "exiting" ? "landing-zone--pulse" : ""}`}
            style={{
              left: zoneLeftPx,
              top: zoneTopPx,
              width: zoneWidth,
              height: ZONE_HEIGHT,
            }}
          />
        )}
        {accuracy && (accuracy === "good" || accuracy === "perfect") && (
          <div
            className={`accuracy-feedback accuracy-feedback--${accuracy}`}
            style={{
              left: leftPx,
              top: zoneTopPx,
              width: NOTE_SIZE,
              height: ZONE_HEIGHT,
            }}
          >
            <span className="accuracy-text">
              {accuracy === "perfect" ? "✓ PERFECT!" : "✓ GOOD!"}
            </span>
          </div>
        )}
      </>
    );
  },
);

FallingNote.displayName = "FallingNote";
