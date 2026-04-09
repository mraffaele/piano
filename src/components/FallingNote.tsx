import React from "react";
import type { FallingNoteState } from "../hooks/useFallingNotes";

const NOTE_SIZE = 44;
const ZONE_HEIGHT = 44;

interface FallingNoteProps {
  state: FallingNoteState;
}

/**
 * Renders a single falling note element and its landing zone.
 * All animation is driven by CSS classes applied based on `state.stage`.
 * CSS custom properties pass the computed positions to @keyframes.
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
    } = state;

    const borderRadius = noteHeight === NOTE_SIZE ? "50%" : "12px";

    // CSS custom properties drive the @keyframes animations
    const noteStyle: React.CSSProperties & Record<string, string> = {
      position: "absolute",
      width: `${NOTE_SIZE}px`,
      height: `${noteHeight}px`,
      left: `${leftPx}px`,
      top: `${startTop}px`,
      transform: "translate(-50%, 0)",
      borderRadius,
      background: "linear-gradient(180deg, #ffefc2 0%, #ffcf5c 100%)",
      boxShadow:
        "0 10px 30px rgba(255, 150, 0, 0.28), 0 2px 6px rgba(0,0,0,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "700",
      color: "#111",
      pointerEvents: "none",
      willChange: "transform, opacity",
      // CSS custom properties for keyframe animations
      "--delta-y": `${deltaY}px`,
      "--bounce-distance": `${bounceDistance}px`,
      "--exit-distance": `${exitDistance}px`,
      "--fall-ms": `${fallMs}ms`,
    };

    return (
      <>
        <div
          className={`falling-note falling-note--${stage}`}
          style={noteStyle}
        />
        {showZone && (
          <div
            className={`landing-zone ${stage === "bouncing" || stage === "exiting" ? "landing-zone--pulse" : ""}`}
            style={{
              position: "absolute",
              left: `${zoneLeftPx}px`,
              top: `${zoneTopPx}px`,
              width: `${zoneWidth}px`,
              height: `${ZONE_HEIGHT}px`,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}
      </>
    );
  },
);

FallingNote.displayName = "FallingNote";
