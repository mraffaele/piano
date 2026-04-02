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
    ],
  },
  {
    id: "old_macdonald",
    title: "Old MacDonald",
    tempo: 100,
    events: [
      { time: 0, note: "E4", dur: 1 },
      { time: 1, note: "D4", dur: 1 },
      { time: 2, note: "C4", dur: 1 },
      { time: 3, note: "D4", dur: 1 },

      { time: 4, note: "E4", dur: 1 },
      { time: 5, note: "E4", dur: 1 },
      { time: 6, note: "E4", dur: 2 },

      { time: 8, note: "D4", dur: 1 },
      { time: 9, note: "D4", dur: 1 },
      { time: 10, note: "D4", dur: 2 },

      { time: 12, note: "E4", dur: 1 },
      { time: 13, note: "G4", dur: 1 },
      { time: 14, note: "G4", dur: 2 },

      { time: 16, note: "E4", dur: 1 },
      { time: 17, note: "D4", dur: 1 },
      { time: 18, note: "C4", dur: 1 },
      { time: 19, note: "D4", dur: 1 },

      { time: 20, note: "E4", dur: 1 },
      { time: 21, note: "E4", dur: 1 },
      { time: 22, note: "E4", dur: 1 },

      { time: 24, note: "D4", dur: 1 },
      { time: 25, note: "D4", dur: 1 },
      { time: 26, note: "E4", dur: 1 },
      { time: 27, note: "D4", dur: 1 },
      { time: 28, note: "C4", dur: 2 },
    ],
  },
  {
    id: "happy_birthday",
    title: "Happy Birthday",
    tempo: 140,
    events: [
      // phrase 1
      { time: 0, note: "G4", dur: 0.75 },
      { time: 1, note: "G4", dur: 1 },
      { time: 2, note: "A4", dur: 2 },
      { time: 4, note: "G4", dur: 2 },
      { time: 6, note: "C5", dur: 2 },
      { time: 8, note: "B4", dur: 2 },
      // phrase 2
      { time: 11, note: "G4", dur: 0.75 },
      { time: 12, note: "G4", dur: 1 },
      { time: 13, note: "A4", dur: 2 },
      { time: 15, note: "G4", dur: 2 },
      { time: 17, note: "D5", dur: 2 },
      { time: 19, note: "C5", dur: 2 },
      //phrase 3
      { time: 22, note: "G4", dur: 1 },
      { time: 23, note: "G4", dur: 1 },
      { time: 24, note: "G5", dur: 2 },
      { time: 26, note: "E5", dur: 2 },
      { time: 28, note: "C5", dur: 2 },
      { time: 30, note: "B4", dur: 2 },
      { time: 32, note: "A4", dur: 2 },
      //phrase 4
      { time: 35, note: "F5", dur: 1 },
      { time: 36, note: "F5", dur: 1 },
      { time: 37, note: "E5", dur: 2 },
      { time: 39, note: "C5", dur: 2 },
      { time: 41, note: "D5", dur: 2 },
      { time: 43, note: "C5", dur: 2 },
    ],
  },
  {
    id: "mary_had_a_little_lamb",
    title: "Mary Had a Little Lamb",
    tempo: 90,
    events: [
      { time: 0, note: "E5", dur: 1 },
      { time: 1, note: "D5", dur: 1 },
      { time: 2, note: "C5", dur: 1 },
      { time: 3, note: "D5", dur: 1 },
      { time: 4, note: "E5", dur: 1 },
      { time: 5, note: "E5", dur: 1 },
      { time: 6, note: "E5", dur: 2 },
      { time: 8, note: "D5", dur: 1 },
      { time: 9, note: "D5", dur: 1 },
      { time: 10, note: "D5", dur: 2 },
      { time: 12, note: "E5", dur: 1 },
      { time: 13, note: "G5", dur: 1 },
      { time: 14, note: "G5", dur: 2 },
      { time: 16, note: "E5", dur: 1 },
      { time: 17, note: "D5", dur: 1 },
      { time: 18, note: "C5", dur: 1 },
      { time: 19, note: "D5", dur: 1 },
      { time: 20, note: "E5", dur: 1 },
      { time: 21, note: "E5", dur: 1 },
      { time: 22, note: "E5", dur: 2 },
      { time: 24, note: "D5", dur: 1 },
      { time: 25, note: "D5", dur: 1 },
      { time: 26, note: "E5", dur: 1 },
      { time: 27, note: "D5", dur: 1 },
      { time: 28, note: "C5", dur: 2 },
    ],
  },
  // {
  //   id: "perfect_ed_sheeran",
  //   title: "Perfect (Ed Sheeran)",
  //   tempo: 95,
  //   events: [
  //     // I found a love...
  //     { time: 0, note: "E4", dur: 1 },
  //     { time: 1, note: "G4", dur: 1 },
  //     { time: 2, note: "A4", dur: 2 },
  //     { time: 4, note: "G4", dur: 2 },

  //     // For me...
  //     { time: 6, note: "E4", dur: 1 },
  //     { time: 7, note: "G4", dur: 1 },
  //     { time: 8, note: "A4", dur: 2 },
  //     { time: 10, note: "G4", dur: 2 },

  //     // Darling just dive right in...
  //     { time: 12, note: "E4", dur: 1 },
  //     { time: 13, note: "G4", dur: 1 },
  //     { time: 14, note: "A4", dur: 1 },
  //     { time: 15, note: "C5", dur: 2 },
  //     { time: 17, note: "B4", dur: 2 },

  //     // Follow my lead...
  //     { time: 19, note: "A4", dur: 1 },
  //     { time: 20, note: "G4", dur: 1 },
  //     { time: 21, note: "E4", dur: 2 },

  //     // I found a girl...
  //     { time: 23, note: "E4", dur: 1 },
  //     { time: 24, note: "G4", dur: 1 },
  //     { time: 25, note: "A4", dur: 2 },
  //     { time: 27, note: "G4", dur: 2 },

  //     // Beautiful and sweet...
  //     { time: 29, note: "E4", dur: 1 },
  //     { time: 30, note: "G4", dur: 1 },
  //     { time: 31, note: "A4", dur: 2 },
  //     { time: 33, note: "G4", dur: 2 },

  //     // Ending phrase
  //     { time: 35, note: "E4", dur: 1 },
  //     { time: 36, note: "D4", dur: 1 },
  //     { time: 37, note: "C4", dur: 3 },
  //   ],
  // },
  // {
  //   id: "dance_monkey",
  //   title: "Dance Monkey (TONES AND I)",
  //   tempo: 100,
  //   events: [
  //     // Dance for me, dance for me, dance for me, oh-oh-oh
  //     { time: 0, note: "E4", dur: 1 },
  //     { time: 1, note: "G4", dur: 1 },
  //     { time: 2, note: "A4", dur: 2 },
  //     { time: 4, note: "A4", dur: 1 },
  //     { time: 5, note: "G4", dur: 1 },
  //     { time: 6, note: "E4", dur: 2 },

  //     { time: 8, note: "E4", dur: 1 },
  //     { time: 9, note: "G4", dur: 1 },
  //     { time: 10, note: "A4", dur: 2 },
  //     { time: 12, note: "A4", dur: 1 },
  //     { time: 13, note: "G4", dur: 1 },
  //     { time: 14, note: "E4", dur: 2 },

  //     // I've never seen anybody do the things you do before
  //     { time: 16, note: "E4", dur: 1 },
  //     { time: 17, note: "G4", dur: 1 },
  //     { time: 18, note: "A4", dur: 1 },
  //     { time: 19, note: "C5", dur: 2 },
  //     { time: 21, note: "B4", dur: 1 },
  //     { time: 22, note: "A4", dur: 1 },
  //     { time: 23, note: "G4", dur: 2 },

  //     // They say move for me...
  //     { time: 25, note: "E4", dur: 1 },
  //     { time: 26, note: "G4", dur: 1 },
  //     { time: 27, note: "A4", dur: 2 },
  //     { time: 29, note: "A4", dur: 1 },
  //     { time: 30, note: "G4", dur: 1 },
  //     { time: 31, note: "E4", dur: 3 },
  //   ],
  // },
  {
    id: "someone_you_loved",
    title: "Someone You Loved (Lewis Capaldi)",
    tempo: 90,
    events: [
      // Opening phrase
      { time: 0, note: "C4", dur: 2 },
      { time: 2, note: "E4", dur: 2 },
      { time: 4, note: "G4", dur: 2 },
      { time: 6, note: "A4", dur: 2 },

      // I’m going under...
      { time: 8, note: "G4", dur: 2 },
      { time: 10, note: "E4", dur: 2 },
      { time: 12, note: "D4", dur: 2 },
      { time: 14, note: "C4", dur: 2 },

      // This all or nothing...
      { time: 16, note: "C4", dur: 2 },
      { time: 18, note: "E4", dur: 2 },
      { time: 20, note: "G4", dur: 2 },
      { time: 22, note: "A4", dur: 2 },

      // Got me sleeping...
      { time: 24, note: "G4", dur: 2 },
      { time: 26, note: "E4", dur: 2 },
      { time: 28, note: "D4", dur: 2 },
      { time: 30, note: "C4", dur: 3 },
    ],
  },
  {
    id: "let_it_go",
    title: "Let It Go",
    tempo: 140,
    events: [
      { time: 0, note: "G5", dur: 1 },
      { time: 1, note: "G#5", dur: 1 },
      { time: 2, note: "C5", dur: 1 },
      { time: 3, note: "G5", dur: 2 },
      { time: 5, note: "G#5", dur: 3 },
      { time: 8, note: "G5", dur: 1 },
      { time: 9, note: "G#5", dur: 1 },
      { time: 10, note: "C5", dur: 1 },
      { time: 11, note: "G#5", dur: 2 },
      { time: 13, note: "G5", dur: 3 },
      { time: 16, note: "A#4", dur: 1 },
      { time: 17, note: "F5", dur: 1 },
      { time: 18, note: "G5", dur: 1 },
      { time: 19, note: "A#4", dur: 1 },
      { time: 20, note: "F5", dur: 2 },
      { time: 22, note: "G5", dur: 2 },
      { time: 23, note: "D#5", dur: 1 },
      { time: 24, note: "C#5", dur: 3 },
      //https://www.youtube.com/watch?v=-amj0ID6NKs
    ],
  },
  {
    id: "sunshine",
    title: "You Are My Sunshine",
    tempo: 100,
    events: [
      { time: 0, note: "G4", dur: 1 },
      { time: 1, note: "C5", dur: 1 },
      { time: 2, note: "D5", dur: 1 },
      { time: 3, note: "E5", dur: 2 },
      { time: 5, note: "E5", dur: 2 },
      { time: 8, note: "E5", dur: 1 },
      { time: 9, note: "D5", dur: 1 },
      { time: 10, note: "E5", dur: 1 },
      { time: 11, note: "C5", dur: 2 },
      { time: 13, note: "C5", dur: 2 },
      //
      { time: 16, note: "C5", dur: 1 },
      { time: 17, note: "D5", dur: 1 },
      { time: 18, note: "E5", dur: 1 },
      { time: 19, note: "F5", dur: 2 },
      { time: 21, note: "A5", dur: 2 },
      { time: 24, note: "A5", dur: 1 },
      { time: 25, note: "G5", dur: 1 },
      { time: 26, note: "F5", dur: 1 },
      { time: 27, note: "E5", dur: 2 },
    ],
  },
];

export default SONGS;
