# Piano — Kid Friendly AI Build

This is a simple, kid‑friendly piano web app built for playing and practicing short melodies on an iPad (or any tablet/desktop).

It's a rough, hacked‑together prototype I built quickly for personal use for my kids.

https://mraffaele.github.io/piano/

Key features

- Simple piano keyboard around middle C (C4–C6).
- Practice panel with selectable songs
- A small curated song library
- Designed for touch: large keys and touch handlers for tablet use.
- Can record and play back melodies.

How to run locally

1. Install dependencies: `npm install` or `yarn`.
2. Start dev server: `npm run dev`.
3. Open the app on your iPad by visiting the dev server URL (or run on your desktop).

Notes

- Tap the initial "Start Playing" button to unlock audio on iOS.
- Use the Practice panel to select songs

Development

- Piano keys and frequencies are defined in `src/utils/noteFrequencies.ts`.
- Songs live in `src/data/songs.ts` and have matching markdown in `songs/`.
- The Practice UI is in `src/components/PracticePanel.tsx`.
