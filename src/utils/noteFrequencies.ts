// Note frequencies for piano keys C4 to C6 (2 octaves + 1 key = 25 keys)
// Using equal temperament tuning with A4 = 440 Hz

export interface NoteInfo {
  note: string;
  frequency: number;
  isBlack: boolean;
  octave: number;
}

// Calculate frequency using equal temperament formula
// f = 440 * 2^((n-49)/12) where n is the key number (A4 = 49)
const calculateFrequency = (semitonesFromA4: number): number => {
  return 440 * Math.pow(2, semitonesFromA4 / 12);
};

// Note names in order within an octave
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const blackKeys = new Set(['C#', 'D#', 'F#', 'G#', 'A#']);

// Generate notes from C4 to C6 (25 keys)
export const generateNotes = (): NoteInfo[] => {
  const notes: NoteInfo[] = [];
  
  // C4 is 9 semitones below A4
  const c4SemitonesFromA4 = -9;
  
  // Generate 25 keys (C4 to C6 inclusive)
  for (let i = 0; i < 25; i++) {
    const octave = Math.floor((i + 0) / 12) + 4;
    const noteIndex = i % 12;
    const noteName = noteNames[noteIndex];
    const semitones = c4SemitonesFromA4 + i;
    
    notes.push({
      note: `${noteName}${octave}`,
      frequency: calculateFrequency(semitones),
      isBlack: blackKeys.has(noteName),
      octave,
    });
  }
  
  return notes;
};

// Pre-generated notes for the piano
export const PIANO_NOTES = generateNotes();

// Map of note name to frequency for quick lookup
export const NOTE_FREQUENCIES: Record<string, number> = PIANO_NOTES.reduce(
  (acc, { note, frequency }) => {
    acc[note] = frequency;
    return acc;
  },
  {} as Record<string, number>
);
