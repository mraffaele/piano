# Piano Codebase Architecture Guide for AI Agents

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Component Reference](#component-reference)
4. [Hook Reference](#hook-reference)
5. [Core Systems](#core-systems)
6. [Adding Features](#adding-features)
7. [Known Issues](#known-issues--workarounds)
8. [Summary](#summary-for-ai-agents)

---

## Quick Overview

**Piano** is a React 18 + TypeScript piano app for iPad with Web Audio API synthesis.

**Core Features**: 25-key piano (C4–C6), multi-touch with velocity, recording (3 tracks max), practice mode with falling notes, localStorage persistence.

**Key Files**:

- `soundTypes.ts`: Piano sound preset
- `usePianoSynth.ts`: Web Audio synthesis
- `Piano.tsx`: Main coordinator
- `useRecorder.ts`: Recording/playback
- `useTouchHandler.ts`: Multi-touch input
- `useFallingNotes.ts`: React-driven falling note state machine
- `FallingNote.tsx`: Falling note visual component
- `PracticePanel.tsx`: Practice mode with difficulty selection

---

## Architecture & Data Flow

### Application Hierarchy

```
App.tsx
├── RotateOverlay
├── Piano (coordinator)
│   ├── FallingNote[] (React-driven falling note visuals)
│   ├── Key (25 keys)
│   ├── RecordingControls
│   ├── TrackList
│   └── SoundSelector (disabled)
└── PracticePanel (practice mode + difficulty selection)
```

### State Management

| Layer           | Location                     | Data                                                                                                    |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **React State** | Component-level              | `pressedCounts`, `soundType`, `playbackSoundType`, `selectedSong`, `isPlaying`, `isMuted`, `difficulty` |
| **Hook Refs**   | usePianoSynth                | `audioContextRef`, `activeNotesRef`, `masterGainRef`                                                    |
|                 | useRecorder                  | `currentEvents`, `tracks`, `activeTrackId`, `recordingStartTime`                                        |
|                 | useTouchHandler              | `activeTouchesRef`, `releasingTouchesRef`                                                               |
|                 | useFallingNotes              | `fallingNotes[]`, `timeoutsRef`                                                                         |
| **Persistent**  | localStorage['piano-tracks'] | Track[] (max 3)                                                                                         |

### Data Flows

**User Input → Sound**:

1. Touch event → `useTouchHandler.handleTouchStart()`
2. Find note via `elementFromPoint()` + DOM traversal
3. Calculate velocity from Y position (top=0.2, bottom=1.0)
4. `Piano.handleNoteStart()` → `usePianoSynth.playNote()`
5. Web Audio creates oscillators, applies ADSR envelope
6. If recording: `useRecorder.recordNoteStart()`
7. Visual feedback: `setPressedCounts` updates CSS

**Recording**: Timestamp events during user input → Save to localStorage
**Playback**: Schedule timeouts per event timestamp → Dispatch custom events → Audio synthesis

### Component Communication

| Channel              | Direction             | Events                                                                     |
| -------------------- | --------------------- | -------------------------------------------------------------------------- |
| **Direct callbacks** | Piano ↔ Children      | `onNoteStart`, `onNoteEnd`, `onRecord`, `onSave`                           |
| **Custom events**    | PracticePanel → Piano | `practice:visualStart`, `practice:play`, `practice:stop`, `practice:clear` |
| **Hook returns**     | Hooks → Piano         | `playNote()`, `stopNote()`, `recordNoteStart()`, `playTrack()`             |

---

## Component Reference

### Major Components

| Component                 | Purpose                                                                   | Key State                                                         |
| ------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Piano.tsx**             | Render 25 keys, coordinate audio/recording/input, falling notes animation | `pressedCounts`, `soundType`, `playbackSoundType`                 |
| **PracticePanel.tsx**     | Song selection, playback with visual cues, difficulty selection           | `selectedSong`, `isPlaying`, `isLooping`, `isMuted`, `difficulty` |
| **RecordingControls.tsx** | Record/Save/Clear UI, state indicators                                    | Button display based on `recorderState`                           |
| **TrackList.tsx**         | List saved tracks, play/delete/rename                                     | Track array, active track ID                                      |

### Minor Components

| Component             | Purpose                                                     |
| --------------------- | ----------------------------------------------------------- |
| **App.tsx**           | Splash screen, audio unlock, root layout                    |
| **Key.tsx**           | Individual key rendering, DOM registration                  |
| **FallingNote.tsx**   | Single falling note + landing zone rendering (CSS-animated) |
| **SoundSelector.tsx** | Sound selection UI (currently disabled)                     |
| **RotateOverlay.tsx** | Portrait mode warning                                       |

---

## Hook Reference

### `usePianoSynth.ts`

**Purpose**: Web Audio API synthesis engine

**Returns**: `{ playNote(note, freq, velocity), stopNote(note) }`

**Key Functions**:

- `playNote()`: Lazy-init AudioContext (iOS compliant), create oscillators per harmonic, apply ADSR, vibrato LFO, pitch bend
- `stopNote()`: Apply release envelope, stop oscillators, cleanup

**State**: `audioContextRef`, `activeNotesRef: Map<note, {oscillators, gainNode, lfoOsc?, lfoGain?}>`, `masterGainRef` (0.5 attenuation)

**ADSR Envelope**: Attack → Decay → Sustain (held level) → Release (on stop)
**Cleanup**: Removes orphaned oscillators, closes context on unmount

---

### `useRecorder.ts`

**Purpose**: Recording state machine + localStorage persistence

**Returns**:

```
{
  state, hasCurrentRecording, tracks, activeTrackId,
  startRecording(), stopRecording(), saveTrack(), deleteTrack(),
  recordNoteStart(), recordNoteEnd(), playTrack(), stopPlayback()
}
```

**State Machine**: `idle` ↔ `recording` ↔ `playing`

**Event Structure**: `{type: 'start'|'end', note, frequency, velocity, timestamp}`

**Recording**: Capture timestamps + events in memory, persist on save
**Playback**: Schedule timeouts per event.timestamp, infinite loop until stop
**Storage**: Key `'piano-tracks'`, max 3 tracks, full array written per save

---

### `useTouchHandler.ts`

**Purpose**: Multi-touch + mouse input with velocity sensitivity

**Returns**: `{ touchHandlers: {onTouchStart, onTouchMove, onTouchEnd, onTouchCancel}, mouseHandlers: {onMouseDown, onMouseUp, onMouseEnter, onMouseLeave}, onNoteStart, onNoteEnd }`

**Velocity**: Y position → normalized 0–1 → mapped to 0.2–1.0 (soft to loud)

**Multi-Touch**: Track per `touch.identifier`, supports 10+ simultaneous notes
**Key Changes**: End old note → Start new note when finger moves across keys
**Release Debounce**: Mark touching as "releasing" for 50ms on lift-off, skip spurious `touchmove` events (iPad fix)

**Handlers**:

- `handleTouchStart/Move/End`: DOM traversal via `elementFromPoint()`, velocity calc, state tracking
- Mouse handlers: Same logic, single "touch" ID = -1

---

### `useFallingNotes.ts`

**Purpose**: React-driven falling note state machine (replaced previous DOM-based approach in Piano.tsx)

**Returns**: `{ fallingNotes: FallingNoteState[], addFallingNote(...), clearAll() }`

**Key Functions**:

- `addFallingNote(note, keyRect, containerRect, containerHeight, fallMs, durationMs?)`: Creates a new falling note state entry, calculates all positions/dimensions, schedules stage transitions
- `clearAll()`: Cancels all pending timeouts and removes all notes from state

**Animation Stages**: `"falling"` → `"bouncing"` → `"exiting"` (each drives a CSS class)

**Stage Durations**: BOUNCE_MS = 220, EXIT_MS = 400, ZONE_LINGER_MS = 700

**Note Height**: When `durationMs` is provided, height scales at 44px/second (min 44px). Circular shape for minimum size, rounded rectangle for longer notes.

**State**: `fallingNotes[]` (React state), `timeoutsRef` (tracks pending stage transition timeouts for cleanup)

**Lifecycle**: Note added → falls linearly → bounces on landing → slides down + fades out → removed from state

---

## Core Systems

### Sound Synthesis System

**SoundPreset Structure** (soundTypes.ts):

- `name`, `emoji`: Display info
- `envelope`: {attack, decay, sustain, release} in seconds
- `harmonics[]`: {freqMultiplier, gainMultiplier, waveform, detune?}
- `pitchBend?`, `vibrato?`: LFO modulation

**Synthesis**: Harmonic oscillators (polyharmonic), each with independent frequency/waveform/gain. LFO modulates detune for vibrato. Pitch bend sweeps frequency. ADSR shapes loudness.

---

### Recording & Playback System

**Recording Phase**:

1. `startRecording()` resets events array
2. Each note press/release → timestamped event
3. `saveTrack()` persists to localStorage

**Playback Phase**:

1. `playTrack(id)` extracts events
2. Schedule timeouts: `setTimeout(() => onNoteStart(note, freq, vel), delayMs)`
3. Auto-loop infinitely until `stopPlayback()`

**Timing**: Absolute millisecond timestamps, no beat/tempo conversion
**Storage Schema**: `{id, name, events, createdAt, duration, soundType}`
**Limitations**: Max 3 tracks, no batching, silent fail if localStorage unavailable

---

### Input Handling System

**Touch Flow**:

- `touchstart` → `elementFromPoint()` → DOM traversal → velocity calc → `onNoteStart()`
- `touchmove` → detect key change → `onNoteEnd()` + `onNoteStart()`
- `touchend` → mark releasing → `onNoteEnd()` → cleanup 50ms later

**Velocity**: Y position relative to key bounding rect, normalized 0–1, mapped 0.2–1.0

**Multi-Touch**: Track per `touch.identifier`, simultaneous notes on different keys

**Release Debouncing** (iPad fix): `releasingTouchesRef` prevents spurious `onNoteStart` during lift-off

---

### Visual State System

**Key Pressing** (`pressedCounts`): `Record<note, count>` tracks overlapping presses. Prevents premature visual release if same note played twice.

**Falling Notes** (practice mode): Managed by `useFallingNotes` hook as React state. Listens for `practice:visualStart` (with `durationMs` for note height), creates `FallingNoteState` entries rendered by `FallingNote` component. CSS animations drive the motion through stages (falling → bouncing → exiting). `practice:clear` event triggers `clearAll()` to remove all notes immediately.

**Recording Feedback**: Status indicators "REC", "LOOPING", "UNSAVED"

**Sound Switching**: `soundType` for live, `playbackSoundType` for track playback (independent)

---

### Practice Mode System

**Song Definition** (data/songs.ts): `{id, title, tempo: BPM, events: [{time: beat, note, dur: beats}]}`

**Difficulty System**: 4 levels scale the song tempo — easy (50%), medium (75%), hard (100%), silly (150%). Effective tempo = `song.tempo * DIFFICULTY_TEMPO_SCALE[difficulty]`. Changing difficulty while playing restarts playback.

**Playback Flow**:

1. Dispatch `practice:visualStart` with `durationMs` → falling animation (note height proportional to duration)
2. Wait `FALL_MS` (1800ms)
3. Dispatch `practice:play` with audio (respects `isMuted`)
4. Wait note duration
5. Dispatch `practice:stop`
6. Loop if `isLooping`

**Stop Flow**: Dispatch `practice:clear` → clears all falling notes immediately, then stops all sounding notes.

**Timing**: `beatMs = (60 / effectiveTempo) * 1000`, `timeMs = event.time * beatMs`
**Muting**: `isMuted` flag checked, audio only (visuals unaffected)

---

## Adding Features

### Add New Sound Instrument

1. `src/utils/soundTypes.ts` → add `SoundPreset` to `SOUND_TYPES`
2. Define: name, emoji, envelope (ADSR), harmonics, optional pitch bend/vibrato
3. Key decisions: harmonic count (richness vs performance), attack (responsiveness), release (tail length), waveforms, vibrato depth

### Add Recording Feature

1. Extend `Track` interface in `useRecorder.ts`
2. Update `saveTrack()` to include field
3. Update `loadTracksFromStorage()` if needed
4. Update TrackList UI
5. Test save/load cycle

### Add Practice Song

1. `src/data/songs.ts` → add `Song` object with events array
2. Format: `{time: beat#, note: 'C4', dur: beats}`
3. Test tempo accuracy

### Modify Input Behavior

1. Edit `useTouchHandler.ts` handlers
2. Adjust `calculateVelocity()` (min 0.2 → max 1.0)
3. Test multi-touch edge cases

### Add UI Feature

1. Add state to component
2. Create handler function
3. Pass as prop or dispatch custom event
4. Add CSS styling

---

## Common Patterns

**Active Notes Access**: `activeNotesRef.current.has/get/set/delete(note)`

**Event Scheduling**: Store timeout IDs, clear all on stop with `timeoutIds.forEach(id => clearTimeout(id))`

**Multi-Touch Changes**: End old note BEFORE starting new note, skip "releasing" touches, validate element exists

**Press State**: `pressedCounts` tracks active count, `isPressed={pressedCounts[note] > 0}`, Key applies CSS class

**Custom Events**: `window.dispatchEvent(new CustomEvent('name', {detail: {...}}))` + `window.addEventListener('name', handler)`

**Lazy Init**: Check if exists, create if not, await async operations (iOS requirement)

---

## Known Issues & Workarounds

| Issue                  | Symptom                        | Cause                                            | Workaround                                                    | Location                                    |
| ---------------------- | ------------------------------ | ------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| iPad note replay       | Note plays again on release    | iOS spurious touchmove during lift-off           | `releasingTouchesRef` flags prevent start during 50ms window  | useTouchHandler.ts:78,122                   |
| iOS audio unlock       | No sound on first touch        | AudioContext suspended by iOS autoplay policy    | `unlockAudio()` + `context.resume()` awaited                  | unlockAudio.ts, usePianoSynth.ts:47         |
| Playback cuts off      | Last notes missing             | Scheduling uses timestamp only, ignores duration | Rely on release envelope, or estimate from next event         | useRecorder.ts                              |
| Max 3 tracks           | Can't save more                | Hardcoded limit for localStorage                 | Increase limit if needed                                      | useRecorder.ts                              |
| Touch velocity flat    | Soft/loud difference inaudible | Range 0.2–1.0 too narrow                         | Adjust minVelocity/maxVelocity or peakGain                    | useTouchHandler.ts:25, usePianoSynth.ts:249 |
| Storage quota exceeded | Can't save tracks              | Large track count consumes quota                 | Implement cleanup UI (not yet done)                           | useRecorder.ts                              |
| Practice timing drifts | Playback desyncs               | setTimeout drift accumulates (~50ms/sec)         | Use requestAnimationFrame for better timing (refactor needed) | PracticePanel.tsx                           |
| SoundSelector disabled | Instrument selector hidden     | Not integrated with Piano                        | Remove return null, add onSoundChange callback                | SoundSelector.tsx:15                        |

---

## Development Workflow

**Add instrument**: `src/utils/soundTypes.ts` → add SoundPreset to SOUND_TYPES
**Fix touch issue**: `src/hooks/useTouchHandler.ts` → modify handler logic
**Add song**: `src/data/songs.ts` → add Song object
**Modify envelope**: `src/utils/soundTypes.ts` → adjust ADSR values
**Debug audio**: `window.__appAudio` exposes AudioContext, check state/currentTime in Safari console

**Build**: `npm run dev` (dev server), `npm run build` (tsc + vite), `npm run deploy` (GitHub Pages)

---

## Performance Notes

**Optimizations**: Lazy AudioContext, ref-based DOM access, cached noise buffer, active note tracking, useMemo on key separation

**Bottlenecks**: Falling notes React re-renders (many simultaneous notes), timeout scheduling, localStorage serialization, touch event handlers

**Scaling**: >100 tracks? Implement virtual scroll. Better timing? Use requestAnimationFrame. Quota issues? Implement cleanup UI. Touch lag? Profile with DevTools.

---

## Summary for AI Agents

### Key Responsibilities by File

| File                    | Responsibility                                                     |
| ----------------------- | ------------------------------------------------------------------ |
| `Piano.tsx`             | Orchestrate input, coordinate audio/recording, manage visual state |
| `usePianoSynth.ts`      | Web Audio synthesis (oscillators, envelopes, effects)              |
| `useRecorder.ts`        | Recording state machine, persistence, playback scheduling          |
| `useTouchHandler.ts`    | Multi-touch input, velocity calculation, state tracking            |
| `useFallingNotes.ts`    | React-driven falling note state machine, stage transitions         |
| `soundTypes.ts`         | Piano sound preset definition                                      |
| `noteFrequencies.ts`    | Note names + frequency lookup (C4–C6)                              |
| `Key.tsx`               | Key rendering + DOM registration                                   |
| `FallingNote.tsx`       | Single falling note + landing zone rendering                       |
| `RecordingControls.tsx` | Record/save/clear UI                                               |
| `TrackList.tsx`         | Track list display + management                                    |
| `PracticePanel.tsx`     | Song selection + event scheduling + difficulty                     |

### Critical Data Structures

- **Track**: `{id, name, events: NoteEvent[], createdAt, duration, soundType}`
- **NoteEvent**: `{type: 'start'|'end', note, frequency, velocity, timestamp}`
- **SoundPreset**: `{name, envelope, harmonics: Harmonic[], pitchBend?, vibrato?}`
- **ActiveNote**: `{oscillators[], gainNode, lfoOsc?, lfoGain?}`
- **FallingNoteState**: `{id, note, stage: 'falling'|'bouncing'|'exiting', fallMs, noteHeight, leftPx, deltaY, showZone, zoneLeftPx, zoneTopPx, zoneWidth}`

### Event Flow

```
User Touch → useTouchHandler → Piano.handleNoteStart()
  ├→ usePianoSynth.playNote() [audio]
  ├→ useRecorder.recordNoteStart() [recording]
  └→ setPressedCounts() [visual]

User Release → useTouchHandler → Piano.handleNoteEnd()
  ├→ usePianoSynth.stopNote()
  ├→ useRecorder.recordNoteEnd()
  └→ setPressedCounts()

Practice → PracticePanel → dispatch practice:play/stop → Piano listens
  ├→ dispatch practice:visualStart [falling animation]
  └→ usePianoSynth.playNote() or stopNote()
```

### Testing Priorities

1. **usePianoSynth**: Note play/stop, envelope timing, frequency accuracy
2. **useRecorder**: Record start/stop, save/load, playback scheduling
3. **useTouchHandler**: Multi-touch tracking, velocity calculation, key detection
4. **Integration**: Record → save → play → delete workflow
5. **Timing**: Practice mode event scheduling accuracy

---

**End of AGENTS.md** — Single source of truth for codebase architecture. Update when significant features or patterns change.
