// Generated song definitions derived from songs/*.md
// Each song contains a simple sequence of events (time in beats, note, dur in beats)
export interface SongEvent {
  time: number;
  note: string;
  dur: number;
}

export interface Song {
  id: string;
  title: string;
  tempo: number; // bpm
  events: SongEvent[];
}

export const SONGS: Song[] = [
  {
    id: "twinkle",
    title: "Twinkle Twinkle Little Star",
    tempo: 80,
    events: [
      { time: 0, note: "C4", dur: 1 },
      { time: 1, note: "C4", dur: 1 },
      { time: 2, note: "G4", dur: 1 },
      { time: 3, note: "G4", dur: 1 },
      { time: 4, note: "A4", dur: 1 },
      { time: 5, note: "A4", dur: 1 },
      { time: 6, note: "G4", dur: 2 },
      { time: 8, note: "F4", dur: 1 },
      { time: 9, note: "F4", dur: 1 },
      { time: 10, note: "E4", dur: 1 },
      { time: 11, note: "E4", dur: 1 },
      { time: 12, note: "D4", dur: 1 },
      { time: 13, note: "D4", dur: 1 },
      { time: 14, note: "C4", dur: 2 },
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
  },
  {
    id: "happy_birthday",
    title: "Happy Birthday",
    tempo: 80,
    events: [
      // phrase 1
      { time: 0, note: "G4", dur: 1 },
      { time: 1, note: "G4", dur: 1 },
      { time: 2, note: "A4", dur: 1 },
      { time: 3, note: "G4", dur: 1 },
      { time: 4, note: "C5", dur: 2 },
      { time: 6, note: "B4", dur: 2 },
      // phrase 2
      { time: 8, note: "G4", dur: 1 },
      { time: 9, note: "G4", dur: 1 },
      { time: 10, note: "A4", dur: 1 },
      { time: 11, note: "G4", dur: 1 },
      { time: 12, note: "D5", dur: 2 },
      { time: 14, note: "C5", dur: 2 },
    ],
  },
  {
    id: "mary_had_a_little_lamb",
    title: "Mary Had a Little Lamb",
    tempo: 84,
    events: [
      { time: 0, note: "E4", dur: 1 },
      { time: 1, note: "D4", dur: 1 },
      { time: 2, note: "C4", dur: 1 },
      { time: 3, note: "D4", dur: 1 },
      { time: 4, note: "E4", dur: 2 },
      { time: 6, note: "D4", dur: 2 },
      { time: 8, note: "E4", dur: 1 },
      { time: 9, note: "E4", dur: 1 },
      { time: 10, note: "E4", dur: 2 },
      { time: 12, note: "D4", dur: 1 },
      { time: 13, note: "D4", dur: 1 },
      { time: 14, note: "D4", dur: 2 },
      { time: 16, note: "E4", dur: 1 },
      { time: 17, note: "G4", dur: 2 },
    ],
  },
];

export default SONGS;
