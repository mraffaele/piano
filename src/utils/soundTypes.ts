// Sound type definitions for funny sounds

export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

export interface ADSREnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface Harmonic {
  freqMultiplier: number;
  gainMultiplier: number;
  waveform: OscillatorType;
  detune?: number; // cents
}

export interface SoundPreset {
  name: string;
  emoji: string;
  envelope: ADSREnvelope;
  harmonics: Harmonic[];
  pitchBend?: {
    start: number; // multiplier at start
    end: number; // multiplier at end
    time: number; // time in seconds
  };
  vibrato?: {
    rate: number; // Hz
    depth: number; // cents
    delay: number; // seconds before vibrato starts
  };
  noise?: {
    type: "white" | "pink";
    gain: number;
  };
  frequencyShift?: number; // shift base frequency by semitones
  isDrumKit?: boolean; // if true, each key plays a different drum sound
  isSoundBoard?: boolean; // if true, each key plays a different sound effect
}

export const SOUND_TYPES: Record<string, SoundPreset> = {
  piano: {
    name: "Piano",
    emoji: "🎹",
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.2,
      release: 0.3,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "sine" },
      { freqMultiplier: 3, gainMultiplier: 0.25, waveform: "sine" },
      { freqMultiplier: 4, gainMultiplier: 0.125, waveform: "sine" },
      { freqMultiplier: 5, gainMultiplier: 0.0625, waveform: "sine" },
    ],
  },

  guitar: {
    name: "Electric",
    emoji: "🎸",
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.6,
      release: 0.3,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 2, gainMultiplier: 0.8, waveform: "square" },
      { freqMultiplier: 3, gainMultiplier: 0.5, waveform: "sawtooth" },
      { freqMultiplier: 4, gainMultiplier: 0.3, waveform: "square" },
      { freqMultiplier: 0.5, gainMultiplier: 0.4, waveform: "sawtooth" }, // sub harmonic for thickness
    ],
    vibrato: { rate: 5, depth: 15, delay: 0.2 }, // subtle vibrato after attack
  },

  bass: {
    name: "Bass",
    emoji: "🎸",
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.2,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "triangle" },
      { freqMultiplier: 0.5, gainMultiplier: 0.3, waveform: "sine" }, // sub
    ],
    frequencyShift: -12, // one octave down
  },

  strings: {
    name: "Strings",
    emoji: "🎻",
    envelope: {
      attack: 0.3,
      decay: 0.2,
      sustain: 0.8,
      release: 0.5,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.002,
        gainMultiplier: 0.8,
        waveform: "sawtooth",
        detune: 8,
      }, // slight detune for richness
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "sine" },
    ],
    vibrato: { rate: 5, depth: 20, delay: 0.4 },
  },

  flute: {
    name: "Flute",
    emoji: "🪈",
    envelope: {
      attack: 0.08,
      decay: 0.1,
      sustain: 0.7,
      release: 0.15,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.15, waveform: "sine" },
      { freqMultiplier: 3, gainMultiplier: 0.05, waveform: "sine" },
    ],
    vibrato: { rate: 5, depth: 12, delay: 0.15 },
    frequencyShift: 12, // one octave up
  },

  // === ANIMAL SOUNDS ===
  duck: {
    name: "Duck",
    emoji: "🦆",
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.5, gainMultiplier: 0.6, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "sawtooth" },
    ],
    pitchBend: { start: 1.3, end: 0.9, time: 0.15 },
    frequencyShift: 12, // one octave up for quacky sound
  },

  cat: {
    name: "Cat",
    emoji: "🐱",
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.6,
      release: 0.4,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "triangle" },
      { freqMultiplier: 2.5, gainMultiplier: 0.4, waveform: "sine" },
      { freqMultiplier: 4, gainMultiplier: 0.2, waveform: "sine" },
    ],
    pitchBend: { start: 0.8, end: 1.2, time: 0.3 },
    vibrato: { rate: 6, depth: 50, delay: 0.1 },
    frequencyShift: 6,
  },

  dog: {
    name: "Dog",
    emoji: "🐕",
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.4,
      release: 0.15,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.2, gainMultiplier: 0.7, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.4, waveform: "sawtooth" },
    ],
    pitchBend: { start: 0.7, end: 1.1, time: 0.1 },
    frequencyShift: 3,
  },

  cow: {
    name: "Cow",
    emoji: "🐄",
    envelope: {
      attack: 0.1,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.01,
        gainMultiplier: 0.9,
        waveform: "sawtooth",
        detune: 10,
      },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "triangle" },
    ],
    vibrato: { rate: 4, depth: 30, delay: 0.2 },
    frequencyShift: -12, // lower
  },

  chicken: {
    name: "Chicken",
    emoji: "🐔",
    envelope: {
      attack: 0.005,
      decay: 0.08,
      sustain: 0.2,
      release: 0.08,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 3, gainMultiplier: 0.5, waveform: "square" },
      { freqMultiplier: 5, gainMultiplier: 0.25, waveform: "square" },
    ],
    pitchBend: { start: 1.5, end: 0.8, time: 0.08 },
    frequencyShift: 18,
  },

  // === 8-BIT / CARTOON SOUNDS ===
  retro: {
    name: "8-Bit",
    emoji: "👾",
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.8,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "square" },
    ],
  },

  powerup: {
    name: "Power-Up",
    emoji: "⭐",
    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0.0,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "square" },
    ],
    pitchBend: { start: 0.5, end: 2, time: 0.3 },
  },

  laser: {
    name: "Laser",
    emoji: "🔫",
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.0,
      release: 0.05,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.5, gainMultiplier: 0.5, waveform: "square" },
    ],
    pitchBend: { start: 3, end: 0.5, time: 0.2 },
    frequencyShift: 12,
  },

  coin: {
    name: "Coin",
    emoji: "🪙",
    envelope: {
      attack: 0.001,
      decay: 0.15,
      sustain: 0.0,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 1.5, gainMultiplier: 0.7, waveform: "square" },
    ],
    frequencyShift: 24,
  },

  blip: {
    name: "Blip",
    emoji: "🎮",
    envelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.3,
      release: 0.05,
    },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "triangle" }],
    frequencyShift: 12,
  },

  // === FART SOUNDS ===
  fart: {
    name: "Toot",
    emoji: "💨",
    envelope: {
      attack: 0.02,
      decay: 0.15,
      sustain: 0.4,
      release: 0.2,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.03,
        gainMultiplier: 0.8,
        waveform: "sawtooth",
        detune: 15,
      },
      { freqMultiplier: 0.5, gainMultiplier: 0.6, waveform: "sawtooth" },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "square" },
    ],
    vibrato: { rate: 25, depth: 100, delay: 0 },
    frequencyShift: -24,
  },

  fartLong: {
    name: "Long Toot",
    emoji: "💩",
    envelope: {
      attack: 0.05,
      decay: 0.3,
      sustain: 0.6,
      release: 0.4,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.02,
        gainMultiplier: 0.9,
        waveform: "sawtooth",
        detune: 20,
      },
      { freqMultiplier: 0.5, gainMultiplier: 0.5, waveform: "sawtooth" },
    ],
    vibrato: { rate: 15, depth: 150, delay: 0 },
    pitchBend: { start: 1.2, end: 0.7, time: 0.5 },
    frequencyShift: -30,
  },

  squeaky: {
    name: "Squeaky",
    emoji: "🎈",
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.15,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.6, waveform: "sine" },
      { freqMultiplier: 3, gainMultiplier: 0.4, waveform: "sine" },
    ],
    vibrato: { rate: 30, depth: 80, delay: 0 },
    frequencyShift: 24,
  },

  // === SILLY INSTRUMENTS ===
  kazoo: {
    name: "Kazoo",
    emoji: "🎺",
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.8,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "sawtooth" },
      { freqMultiplier: 3, gainMultiplier: 0.25, waveform: "square" },
    ],
    vibrato: { rate: 8, depth: 40, delay: 0 },
  },

  slideWhistle: {
    name: "Slide Whistle",
    emoji: "🎵",
    envelope: {
      attack: 0.01,
      decay: 0.05,
      sustain: 0.9,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "sine" },
    ],
    pitchBend: { start: 0.5, end: 1.5, time: 0.4 },
    frequencyShift: 12,
  },

  rubberChicken: {
    name: "Rubber Chicken",
    emoji: "🐓",
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.3,
      release: 0.3,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.5, gainMultiplier: 0.6, waveform: "square" },
      { freqMultiplier: 2.5, gainMultiplier: 0.3, waveform: "sawtooth" },
    ],
    pitchBend: { start: 1.8, end: 0.6, time: 0.3 },
    vibrato: { rate: 12, depth: 60, delay: 0 },
    frequencyShift: 6,
  },

  boing: {
    name: "Boing",
    emoji: "🦘",
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0.0,
      release: 0.1,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "sine" },
      { freqMultiplier: 3, gainMultiplier: 0.25, waveform: "triangle" },
    ],
    pitchBend: { start: 2, end: 0.5, time: 0.4 },
    vibrato: { rate: 20, depth: 100, delay: 0 },
  },

  honk: {
    name: "Honk",
    emoji: "📯",
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.15,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.02,
        gainMultiplier: 0.8,
        waveform: "sawtooth",
        detune: 5,
      },
      { freqMultiplier: 2, gainMultiplier: 0.4, waveform: "square" },
      { freqMultiplier: 3, gainMultiplier: 0.2, waveform: "sawtooth" },
    ],
    frequencyShift: -6,
  },

  wobble: {
    name: "Wobble",
    emoji: "🌀",
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2,
    },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      {
        freqMultiplier: 1.01,
        gainMultiplier: 0.8,
        waveform: "sine",
        detune: 30,
      },
      { freqMultiplier: 2, gainMultiplier: 0.4, waveform: "triangle" },
    ],
    vibrato: { rate: 6, depth: 200, delay: 0 },
  },

  // === DRUM KIT ===
  drums: {
    name: "Drums",
    emoji: "🥁",
    isDrumKit: true,
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.0,
      release: 0.1,
    },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
  },

  // === SOUND BOARD ===
  soundboard: {
    name: "SFX",
    emoji: "🔊",
    isDrumKit: true, // reuse drum kit behavior for per-key sounds
    isSoundBoard: true,
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.0,
      release: 0.1,
    },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
  },
};

// Group sounds by category for the UI
// export const SOUND_CATEGORIES = {
//   instruments: ['piano', 'guitar', 'strings', 'drums'],
//   retro: ['powerup', 'laser', 'blip'],
//   silly: ['chicken', 'fart', 'kazoo', 'slideWhistle', 'rubberChicken', 'boing', 'wobble', 'soundboard'],
// };
export const SOUND_CATEGORIES = {
  instruments: [
    "piano",
    "guitar",
    "strings",
    "drums",
    "powerup",
    // "laser",
    "blip",
    "chicken",
    // "fart",
    "kazoo",
    "slideWhistle",
    "rubberChicken",
    // "boing",
    "wobble",
    // "soundboard",
  ],
};

// export const CATEGORY_NAMES: Record<string, string> = {
//   instruments: '🎹 Instruments',
//   retro: '👾 8-Bit',
//   silly: '🎪 Silly',
// };

export const CATEGORY_NAMES: Record<string, string> = {
  instruments: "🎹 Instruments",
};

// Drum kit sounds mapped to note indices (0-24 for our 25-key piano)
// Each drum has its own synthesis parameters
export interface DrumSound {
  name: string;
  baseFreq: number;
  envelope: ADSREnvelope;
  harmonics: Harmonic[];
  pitchBend?: { start: number; end: number; time: number };
  noise?: { gain: number; decay: number };
  vibrato?: { rate: number; depth: number; delay: number };
}

export const DRUM_SOUNDS: DrumSound[] = [
  // C4 - Kick drum
  {
    name: "Kick",
    baseFreq: 60,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 0.5, gainMultiplier: 0.5, waveform: "sine" },
    ],
    pitchBend: { start: 4, end: 1, time: 0.08 },
  },
  // C#4 - Kick alt
  {
    name: "Kick 2",
    baseFreq: 50,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.3, waveform: "triangle" },
    ],
    pitchBend: { start: 3, end: 1, time: 0.06 },
  },
  // D4 - Snare
  {
    name: "Snare",
    baseFreq: 180,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.7, waveform: "triangle" },
      { freqMultiplier: 2.5, gainMultiplier: 0.3, waveform: "square" },
    ],
    noise: { gain: 0.8, decay: 0.12 },
  },
  // D#4 - Rimshot
  {
    name: "Rim",
    baseFreq: 400,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2.2, gainMultiplier: 0.5, waveform: "square" },
    ],
  },
  // E4 - Clap
  {
    name: "Clap",
    baseFreq: 1000,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.3, waveform: "triangle" },
    ],
    noise: { gain: 1, decay: 0.15 },
  },
  // F4 - Closed hi-hat
  {
    name: "Hi-Hat",
    baseFreq: 6000,
    envelope: { attack: 0.001, decay: 0.06, sustain: 0.0, release: 0.05 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.3, waveform: "square" },
      { freqMultiplier: 1.34, gainMultiplier: 0.2, waveform: "square" },
    ],
    noise: { gain: 0.7, decay: 0.05 },
  },
  // F#4 - Open hi-hat
  {
    name: "Open HH",
    baseFreq: 6000,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.2 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.3, waveform: "square" },
      { freqMultiplier: 1.34, gainMultiplier: 0.2, waveform: "square" },
    ],
    noise: { gain: 0.7, decay: 0.25 },
  },
  // G4 - Tom low
  {
    name: "Low Tom",
    baseFreq: 100,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.3, waveform: "sine" },
    ],
    pitchBend: { start: 1.5, end: 1, time: 0.1 },
  },
  // G#4 - Tom mid
  {
    name: "Mid Tom",
    baseFreq: 150,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.3, waveform: "sine" },
    ],
    pitchBend: { start: 1.4, end: 1, time: 0.08 },
  },
  // A4 - Tom high
  {
    name: "High Tom",
    baseFreq: 200,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.3, waveform: "sine" },
    ],
    pitchBend: { start: 1.3, end: 1, time: 0.06 },
  },
  // A#4 - Crash
  {
    name: "Crash",
    baseFreq: 5000,
    envelope: { attack: 0.001, decay: 0.8, sustain: 0.1, release: 0.5 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.3, waveform: "square" },
      { freqMultiplier: 1.42, gainMultiplier: 0.2, waveform: "square" },
      { freqMultiplier: 2.11, gainMultiplier: 0.15, waveform: "square" },
    ],
    noise: { gain: 0.6, decay: 0.6 },
  },
  // B4 - Ride
  {
    name: "Ride",
    baseFreq: 5500,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.15, release: 0.3 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.4, waveform: "triangle" },
      { freqMultiplier: 1.5, gainMultiplier: 0.25, waveform: "square" },
    ],
    noise: { gain: 0.3, decay: 0.3 },
  },
  // C5 - Cowbell
  {
    name: "Cowbell",
    baseFreq: 560,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 1.5, gainMultiplier: 0.6, waveform: "square" },
    ],
  },
  // C#5 - Tambourine
  {
    name: "Tamb",
    baseFreq: 8000,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 0.3, waveform: "square" }],
    noise: { gain: 0.8, decay: 0.1 },
  },
  // D5 - Shaker
  {
    name: "Shaker",
    baseFreq: 7000,
    envelope: { attack: 0.01, decay: 0.08, sustain: 0.0, release: 0.05 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 0.2, waveform: "triangle" },
    ],
    noise: { gain: 0.6, decay: 0.06 },
  },
  // D#5 - Conga low
  {
    name: "Conga L",
    baseFreq: 180,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.4, gainMultiplier: 0.2, waveform: "sine" },
    ],
    pitchBend: { start: 1.2, end: 1, time: 0.05 },
  },
  // E5 - Conga high
  {
    name: "Conga H",
    baseFreq: 260,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.4, gainMultiplier: 0.2, waveform: "sine" },
    ],
    pitchBend: { start: 1.15, end: 1, time: 0.04 },
  },
  // F5 - Bongo low
  {
    name: "Bongo L",
    baseFreq: 350,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0.0, release: 0.08 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.2, gainMultiplier: 0.15, waveform: "sine" },
    ],
  },
  // F#5 - Bongo high
  {
    name: "Bongo H",
    baseFreq: 480,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.06 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.2, gainMultiplier: 0.15, waveform: "sine" },
    ],
  },
  // G5 - Woodblock low
  {
    name: "Wood L",
    baseFreq: 600,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.8, gainMultiplier: 0.3, waveform: "triangle" },
    ],
  },
  // G#5 - Woodblock high
  {
    name: "Wood H",
    baseFreq: 900,
    envelope: { attack: 0.001, decay: 0.06, sustain: 0.0, release: 0.04 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.8, gainMultiplier: 0.3, waveform: "triangle" },
    ],
  },
  // A5 - Claves
  {
    name: "Claves",
    baseFreq: 2500,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.03 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 3, gainMultiplier: 0.2, waveform: "sine" },
    ],
  },
  // A#5 - Agogo low
  {
    name: "Agogo L",
    baseFreq: 700,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "triangle" },
      { freqMultiplier: 2.8, gainMultiplier: 0.4, waveform: "triangle" },
    ],
  },
  // B5 - Agogo high
  {
    name: "Agogo H",
    baseFreq: 900,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0.0, release: 0.08 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "triangle" },
      { freqMultiplier: 2.8, gainMultiplier: 0.4, waveform: "triangle" },
    ],
  },
  // C6 - Whistle
  {
    name: "Whistle",
    baseFreq: 2200,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.2, waveform: "sine" },
    ],
  },
];

// Sound Board effects - fun sound effects mapped to keys
export const SOUNDBOARD_SOUNDS: DrumSound[] = [
  // C4 - Doorbell
  {
    name: "Doorbell",
    baseFreq: 880,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.2 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.7, waveform: "sine" },
    ],
  },
  // C#4 - Phone ring
  {
    name: "Phone",
    baseFreq: 440,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.6, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.2, gainMultiplier: 0.8, waveform: "sine" },
    ],
    vibrato: { rate: 20, depth: 50, delay: 0 },
  },
  // D4 - Car horn
  {
    name: "Car Horn",
    baseFreq: 350,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.3, gainMultiplier: 0.7, waveform: "sawtooth" },
      { freqMultiplier: 2, gainMultiplier: 0.4, waveform: "square" },
    ],
  },
  // D#4 - Explosion
  {
    name: "Boom",
    baseFreq: 60,
    envelope: { attack: 0.001, decay: 0.6, sustain: 0.0, release: 0.3 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 0.5, gainMultiplier: 0.8, waveform: "sine" },
    ],
    pitchBend: { start: 3, end: 0.5, time: 0.3 },
    noise: { gain: 1, decay: 0.5 },
  },
  // E4 - Laser zap
  {
    name: "Zap",
    baseFreq: 1200,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      { freqMultiplier: 1.5, gainMultiplier: 0.5, waveform: "square" },
    ],
    pitchBend: { start: 3, end: 0.3, time: 0.15 },
  },
  // F4 - Siren
  {
    name: "Siren",
    baseFreq: 600,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2, gainMultiplier: 0.3, waveform: "sine" },
    ],
    vibrato: { rate: 4, depth: 400, delay: 0 },
  },
  // F#4 - Buzzer
  {
    name: "Buzzer",
    baseFreq: 150,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.7, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.6, waveform: "square" },
      { freqMultiplier: 3, gainMultiplier: 0.4, waveform: "square" },
    ],
  },
  // G4 - Ding
  {
    name: "Ding",
    baseFreq: 1500,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.0, release: 0.3 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.4, gainMultiplier: 0.3, waveform: "sine" },
      { freqMultiplier: 5.5, gainMultiplier: 0.1, waveform: "sine" },
    ],
  },
  // G#4 - Alarm
  {
    name: "Alarm",
    baseFreq: 800,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0.8, release: 0.05 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "square" }],
    vibrato: { rate: 10, depth: 200, delay: 0 },
  },
  // A4 - Pop
  {
    name: "Pop",
    baseFreq: 400,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
    pitchBend: { start: 2, end: 0.5, time: 0.05 },
  },
  // A#4 - Splash
  {
    name: "Splash",
    baseFreq: 200,
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.0, release: 0.2 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 0.3, waveform: "sine" }],
    pitchBend: { start: 1.5, end: 0.8, time: 0.1 },
    noise: { gain: 0.8, decay: 0.3 },
  },
  // B4 - Whoosh
  {
    name: "Whoosh",
    baseFreq: 300,
    envelope: { attack: 0.05, decay: 0.3, sustain: 0.0, release: 0.1 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 0.2, waveform: "sine" }],
    pitchBend: { start: 0.5, end: 2, time: 0.2 },
    noise: { gain: 0.7, decay: 0.25 },
  },
  // C5 - Bonk
  {
    name: "Bonk",
    baseFreq: 300,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 2.3, gainMultiplier: 0.4, waveform: "sine" },
    ],
    pitchBend: { start: 1.5, end: 0.7, time: 0.1 },
  },
  // C#5 - Whistle up
  {
    name: "Wee-oo",
    baseFreq: 800,
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.1 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
    pitchBend: { start: 0.5, end: 2, time: 0.25 },
  },
  // D5 - Whistle down
  {
    name: "Woo-ee",
    baseFreq: 1200,
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.0, release: 0.1 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
    pitchBend: { start: 1.5, end: 0.3, time: 0.25 },
  },
  // D#5 - Spring
  {
    name: "Spring",
    baseFreq: 400,
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.0, release: 0.1 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" }],
    pitchBend: { start: 3, end: 0.3, time: 0.4 },
    vibrato: { rate: 25, depth: 150, delay: 0 },
  },
  // E5 - Tada
  {
    name: "Tada",
    baseFreq: 520,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.2 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "triangle" },
      { freqMultiplier: 1.25, gainMultiplier: 0.7, waveform: "triangle" },
      { freqMultiplier: 1.5, gainMultiplier: 0.5, waveform: "triangle" },
    ],
    pitchBend: { start: 0.8, end: 1, time: 0.05 },
  },
  // F5 - Error
  {
    name: "Error",
    baseFreq: 200,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 1.5, gainMultiplier: 0.6, waveform: "square" },
    ],
  },
  // F#5 - Success
  {
    name: "Success",
    baseFreq: 600,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sine" },
      { freqMultiplier: 1.5, gainMultiplier: 0.6, waveform: "sine" },
    ],
    pitchBend: { start: 0.8, end: 1.2, time: 0.1 },
  },
  // G5 - Blip up
  {
    name: "Blip Up",
    baseFreq: 500,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.05 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "square" }],
    pitchBend: { start: 0.7, end: 1.3, time: 0.08 },
  },
  // G#5 - Blip down
  {
    name: "Blip Dn",
    baseFreq: 700,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.05 },
    harmonics: [{ freqMultiplier: 1, gainMultiplier: 1, waveform: "square" }],
    pitchBend: { start: 1.3, end: 0.7, time: 0.08 },
  },
  // A5 - Coin
  {
    name: "Coin",
    baseFreq: 1800,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 1.5, gainMultiplier: 0.7, waveform: "square" },
    ],
  },
  // A#5 - Power up
  {
    name: "Power Up",
    baseFreq: 300,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "square" },
    ],
    pitchBend: { start: 0.5, end: 2.5, time: 0.35 },
  },
  // B5 - Power down
  {
    name: "Power Dn",
    baseFreq: 600,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.0, release: 0.1 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "square" },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "square" },
    ],
    pitchBend: { start: 2, end: 0.3, time: 0.35 },
  },
  // C6 - Air horn
  {
    name: "Air Horn",
    baseFreq: 450,
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.2 },
    harmonics: [
      { freqMultiplier: 1, gainMultiplier: 1, waveform: "sawtooth" },
      {
        freqMultiplier: 1.02,
        gainMultiplier: 0.9,
        waveform: "sawtooth",
        detune: 10,
      },
      { freqMultiplier: 2, gainMultiplier: 0.5, waveform: "sawtooth" },
      { freqMultiplier: 3, gainMultiplier: 0.3, waveform: "sawtooth" },
    ],
    pitchBend: { start: 0.95, end: 1, time: 0.1 },
  },
];
