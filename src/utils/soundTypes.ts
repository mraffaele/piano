type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

interface ADSREnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

interface Harmonic {
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
  frequencyShift?: number; // shift base frequency by semitones
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
};
