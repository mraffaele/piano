import { useState, useCallback, useRef } from "react";

// Minimum visual size and height scaling for falling notes
const NOTE_SIZE = 44; // px
const HEIGHT_PER_SECOND = 44; // px per second of note duration
const ZONE_HEIGHT = 44; // fixed landing zone height

// Stage durations (ms)
const BOUNCE_MS = 220;
const EXIT_MS = 400;
const ZONE_LINGER_MS = 700;
const ACCURACY_FEEDBACK_MS = 700; // Duration of accuracy feedback animation (matching CSS)

type AnimationStage = "falling" | "bouncing" | "exiting";

export type AccuracyType = "perfect" | "good" | "miss" | null;

export interface FallingNoteState {
  id: string;
  note: string;
  fallMs: number;
  /** Calculated note element height */
  noteHeight: number;
  /** Starting top position inside the container */
  startTop: number;
  /** Horizontal center of the note relative to container */
  leftPx: number;
  /** Vertical distance to travel during fall */
  deltaY: number;
  /** Bounce distance (proportional to note height) */
  bounceDistance: number;
  /** Exit distance (how far below viewport to animate) */
  exitDistance: number;
  /** Whether the note is a black key (shorter exit travel) */
  isBlackKey: boolean;
  /** Current animation stage, drives CSS class */
  stage: AnimationStage;
  /** Show landing zone (only during falling stage) */
  showZone: boolean;
  /** Landing zone position */
  zoneLeftPx: number;
  zoneTopPx: number;
  zoneWidth: number;
  /** Accuracy of the key press: 'perfect' (±50ms), 'good' (±150ms), 'miss' (outside window), or null (not yet evaluated) */
  accuracy: AccuracyType;
  /** Timestamp when the note should land (for accuracy calculation) */
  landingTimeMs: number;
  /** Timestamp when user pressed the correct key (null if not yet pressed) */
  pressedAtMs: number | null;
}

interface UseFallingNotesReturn {
  fallingNotes: FallingNoteState[];
  addFallingNote: (
    note: string,
    keyRect: DOMRect,
    containerRect: DOMRect,
    containerHeight: number,
    fallMs: number,
    durationMs?: number,
    landingTimeMs?: number,
  ) => void;
  markAccuracy: (noteId: string, accuracy: AccuracyType, pressedAtMs: number) => void;
  clearAll: () => void;
}

let nextId = 0;

/**
 * Manages the collection of falling note visuals as React state.
 * Each note progresses through animation stages (falling -> bouncing -> exiting)
 * driven by timeouts. CSS animations handle the actual motion.
 */
export function useFallingNotes(): UseFallingNotesReturn {
  const [fallingNotes, setFallingNotes] = useState<FallingNoteState[]>([]);
  // Track active timeouts so clearAll can cancel pending stage transitions
  const timeoutsRef = useRef<number[]>([]);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      // Remove this timeout from tracking after it fires
      timeoutsRef.current = timeoutsRef.current.filter((t) => t !== id);
      fn();
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const addFallingNote = useCallback(
    (
      note: string,
      keyRect: DOMRect,
      containerRect: DOMRect,
      containerHeight: number,
      fallMs: number,
      durationMs?: number,
      landingTimeMs?: number,
    ) => {
      const id = `fn-${nextId++}`;

      // Calculate dimensions
      const noteHeight = durationMs
        ? Math.max(NOTE_SIZE, (durationMs / 1000) * HEIGHT_PER_SECOND)
        : NOTE_SIZE;

      const startTop = -60;
      const leftPx =
        keyRect.left + keyRect.width / 2 - containerRect.left;

      // Landing position: note center aligns with zone center
      const zoneCenter =
        keyRect.top - containerRect.top + keyRect.height * 0.88;
      const zoneTopPx = zoneCenter - ZONE_HEIGHT / 2;
      const endTop = zoneCenter - noteHeight / 2;
      const deltaY = endTop - startTop;

      const bounceDistance = Math.max(4, noteHeight * 0.15);
      const isBlackKey = note.includes("#");
      const exitDistance = isBlackKey
        ? containerHeight * 0.6 + 100
        : containerHeight + 100;

      // Landing zone dimensions
      const zoneWidth = Math.max(64, keyRect.width * 1.05);
      const zoneLeftPx =
        keyRect.left +
        keyRect.width / 2 -
        containerRect.left -
        zoneWidth / 2;

      const newNote: FallingNoteState = {
        id,
        note,
        fallMs,
        noteHeight,
        startTop,
        leftPx,
        deltaY,
        bounceDistance,
        exitDistance,
        isBlackKey,
        stage: "falling",
        showZone: true,
        zoneLeftPx,
        zoneTopPx,
        zoneWidth,
        accuracy: null,
        landingTimeMs: landingTimeMs ?? 0,
        pressedAtMs: null,
      };

      setFallingNotes((prev) => [...prev, newNote]);

      // Stage transitions via timeouts
      // falling -> bouncing
      scheduleTimeout(() => {
        setFallingNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, stage: "bouncing" as const } : n,
          ),
        );
      }, fallMs);

      // Hide landing zone shortly after landing
      scheduleTimeout(() => {
        setFallingNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, showZone: false } : n,
          ),
        );
      }, fallMs + ZONE_LINGER_MS);

      // bouncing -> exiting
      scheduleTimeout(() => {
        setFallingNotes((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, stage: "exiting" as const } : n,
          ),
        );
      }, fallMs + BOUNCE_MS);

      // Remove from state after exit animation completes
      // If accuracy feedback is shown, ensure we wait for it to complete (600ms)
      const removalDelayMs = fallMs + BOUNCE_MS + EXIT_MS + ACCURACY_FEEDBACK_MS + 50;
      scheduleTimeout(() => {
        setFallingNotes((prev) => prev.filter((n) => n.id !== id));
      }, removalDelayMs);
    },
    [scheduleTimeout],
  );

  const clearAll = useCallback(() => {
    // Cancel all pending stage transitions
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    setFallingNotes([]);
  }, []);

  const markAccuracy = useCallback(
    (noteId: string, accuracy: AccuracyType, pressedAtMs: number) => {
      setFallingNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, accuracy, pressedAtMs } : n,
        ),
      );
    },
    [],
  );

  return { fallingNotes, addFallingNote, markAccuracy, clearAll };
}
