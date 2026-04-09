import { useCallback, useRef, useEffect } from 'react';
import { SOUND_TYPES, SoundPreset } from '../utils/soundTypes';

interface ActiveNote {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lfoOsc?: OscillatorNode;
  lfoGain?: GainNode;
  noiseSource?: AudioBufferSourceNode;
  noiseGain?: GainNode;
}



// --- Shared synthesis helpers ---

interface HarmonicParams {
  freqMultiplier: number;
  gainMultiplier: number;
  waveform: OscillatorType;
  detune?: number;
}

/** Create oscillators for a set of harmonics and connect them to the given gain node. */
const createHarmonics = (
  ctx: AudioContext,
  harmonics: HarmonicParams[],
  baseFrequency: number,
  pitchBend: { start: number; end: number; time: number } | undefined,
  noteGain: GainNode,
  now: number,
): OscillatorNode[] => {
  const oscillators: OscillatorNode[] = [];

  harmonics.forEach((harmonic) => {
    const osc = ctx.createOscillator();
    const harmonicGain = ctx.createGain();

    osc.type = harmonic.waveform;

    const oscFreq = baseFrequency * harmonic.freqMultiplier;

    if (pitchBend) {
      osc.frequency.setValueAtTime(oscFreq * pitchBend.start, now);
      osc.frequency.linearRampToValueAtTime(oscFreq * pitchBend.end, now + pitchBend.time);
    } else {
      osc.frequency.setValueAtTime(oscFreq, now);
    }

    if (harmonic.detune) {
      osc.detune.value = harmonic.detune;
    }

    harmonicGain.gain.value = harmonic.gainMultiplier;

    osc.connect(harmonicGain);
    harmonicGain.connect(noteGain);
    osc.start(now);

    oscillators.push(osc);
  });

  return oscillators;
};

/** Create a vibrato LFO and connect it to all oscillators' detune params. */
const createVibratoLFO = (
  ctx: AudioContext,
  vibrato: { rate: number; depth: number; delay: number },
  oscillators: OscillatorNode[],
  now: number,
): { lfoOsc: OscillatorNode; lfoGain: GainNode } => {
  const lfoOsc = ctx.createOscillator();
  const lfoGain = ctx.createGain();

  lfoOsc.type = 'sine';
  lfoOsc.frequency.value = vibrato.rate;

  if (vibrato.delay > 0) {
    lfoGain.gain.setValueAtTime(0, now);
    lfoGain.gain.linearRampToValueAtTime(vibrato.depth, now + vibrato.delay);
  } else {
    lfoGain.gain.value = vibrato.depth;
  }

  lfoOsc.connect(lfoGain);

  oscillators.forEach(osc => {
    lfoGain.connect(osc.detune);
  });

  lfoOsc.start(now);

  return { lfoOsc, lfoGain };
};

export const usePianoSynth = (soundType: string = 'piano') => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNotesRef = useRef<Map<string, ActiveNote>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);
  const soundTypeRef = useRef<string>(soundType);

  // Keep soundType ref updated
  useEffect(() => {
    soundTypeRef.current = soundType;
  }, [soundType]);

  // Initialize/resume AudioContext. Await resume to ensure iOS unlocks audio
  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.5;
      masterGainRef.current.connect(audioContextRef.current.destination);

      // Expose the AudioContext for debugging (inspect with remote Safari console)
      try {
        window.__appAudio = audioContextRef.current;
      } catch {}
    }

    // Resume if suspended (autoplay policy) and await it so resume() runs inside
    // the user gesture that triggered play. This is required on iOS.
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch {
        // ignore resume failures — callers will handle absence of audio
      }
    }

    return audioContextRef.current;
  }, []);



  // Play a note with velocity (0-1)
  const playNote = useCallback(async (note: string, frequency: number, velocity: number = 0.7) => {
    const ctx = await getAudioContext();
    const masterGain = masterGainRef.current!;
    const now = ctx.currentTime;
    
    // Get the current sound preset
    const preset: SoundPreset = SOUND_TYPES[soundTypeRef.current] || SOUND_TYPES.piano;
    const { envelope, harmonics, pitchBend, vibrato, frequencyShift } = preset;
    
    // Stop any existing instance of this note
    if (activeNotesRef.current.has(note)) {
      stopNote(note);
    }
    
    // Apply frequency shift if specified (in semitones)
    const baseFrequency = frequencyShift
      ? frequency * Math.pow(2, frequencyShift / 12)
      : frequency;
    
    // Create gain node for this note's envelope
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    
    const peakGain = velocity * 0.4; // Scale velocity to reasonable volume
    noteGain.gain.linearRampToValueAtTime(peakGain, now + envelope.attack);
    noteGain.gain.linearRampToValueAtTime(
      peakGain * envelope.sustain,
      now + envelope.attack + envelope.decay
    );
    
    noteGain.connect(masterGain);
    
    // Create oscillators using shared helper
    const oscillators = createHarmonics(ctx, harmonics, baseFrequency, pitchBend, noteGain, now);
    
    // Create vibrato LFO if specified
    let lfoOsc: OscillatorNode | undefined;
    let lfoGain: GainNode | undefined;
    
    if (vibrato) {
      const lfo = createVibratoLFO(ctx, vibrato, oscillators, now);
      lfoOsc = lfo.lfoOsc;
      lfoGain = lfo.lfoGain;
    }
    
    // Store active note
    activeNotesRef.current.set(note, {
      oscillators,
      gainNode: noteGain,
      lfoOsc,
      lfoGain,
    });
  }, [getAudioContext]);

  // Stop a note with release envelope
  const stopNote = useCallback((note: string) => {
    const activeNote = activeNotesRef.current.get(note);
    if (!activeNote) return;
    
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const { oscillators, gainNode, lfoOsc, noiseSource, noiseGain } = activeNote;
    
    // Get current preset for release time
    const preset: SoundPreset = SOUND_TYPES[soundTypeRef.current] || SOUND_TYPES.piano;
    const releaseTime = preset.envelope.release;
    
    // Apply release envelope
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + releaseTime);
    
    // Stop and cleanup oscillators after release
    oscillators.forEach(osc => {
      osc.stop(now + releaseTime + 0.01);
    });
    
    // Stop LFO if exists
    if (lfoOsc) {
      lfoOsc.stop(now + releaseTime + 0.01);
    }
    
    // Stop noise if exists
    if (noiseSource && noiseGain) {
      noiseGain.gain.cancelScheduledValues(now);
      noiseGain.gain.setValueAtTime(noiseGain.gain.value, now);
      noiseGain.gain.linearRampToValueAtTime(0, now + releaseTime);
      try {
        noiseSource.stop(now + releaseTime + 0.01);
      } catch {
        // Already stopped
      }
    }
    
    activeNotesRef.current.delete(note);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeNotesRef.current.forEach((_, note) => {
        stopNote(note);
      });
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
        try { window.__appAudio = undefined; } catch {}
      }
    };
  }, [stopNote]);

  return { playNote, stopNote };
};
