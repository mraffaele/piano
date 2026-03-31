# Mobile Piano Web App

## Summary

## A single-page React application that emulates a realistic 2-octave piano (C4-C6) optimized for mobile/iPad touch interaction, using synthesized piano-like tones via the Web Audio API.

## Core Requirements

| Feature            | Details                                                             |
| ------------------ | ------------------------------------------------------------------- |
| **Keyboard Range** | 2 octaves (C4 to C6, 25 keys including both C's)                    |
| **Sound Engine**   | Web Audio API with synthesized piano-like tones (no samples)        |
| **Framework**      | React                                                               |
| **Layout**         | Horizontal, landscape-optimized                                     |
| **Touch Velocity** | Based on vertical position on key (higher = softer, lower = louder) |
| **Visual Style**   | Flat modern design with color change on press                       |
| **Labels**         | Note names displayed on keys                                        |
| **Hosting**        | GitHub Pages                                                        |

---

## Technical Architecture

src/
├── components/
│ ├── Piano.tsx # Main container
│ ├── Key.tsx # Individual key component
│ └── Octave.tsx # Group of 12 keys
├── hooks/
│ ├── usePianoSynth.ts # Web Audio synthesis logic
│ └── useTouchHandler.ts # Multi-touch + velocity detection
├── utils/
│ └── noteFrequencies.ts # Note-to-frequency mapping
├── App.tsx
└── index.css # Responsive styles

---

## Sound Synthesis Approach

- Use **Web Audio API OscillatorNode** with multiple oscillators to create a richer piano-like timbre
- Apply **ADSR envelope** (Attack, Decay, Sustain, Release) for realistic note shape
- Add subtle **harmonic overtones** to simulate piano strings
- Velocity maps to gain (volume) based on touch Y-position

---

## Responsive Design

- CSS Grid or Flexbox for key layout
- `vh`/`vw` units for full-screen scaling
- Touch-action CSS to prevent browser gestures
- Prevent zoom on double-tap

---

## Stretch Goal: Recording/Playback

- Store note events with timestamps in state
- Replay by scheduling notes using Web Audio's precise timing
- Simple UI: Record/Stop/Play buttons

---

## Deployment

- Build with `npm run build`
- Deploy to GitHub Pages using `gh-pages` package or GitHub Actions
