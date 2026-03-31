import { useCallback, useRef, useEffect } from 'react';
import { SOUND_TYPES, SoundPreset, DRUM_SOUNDS, SOUNDBOARD_SOUNDS, DrumSound } from '../utils/soundTypes';
import { PIANO_NOTES } from '../utils/noteFrequencies';

interface ActiveNote {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lfoOsc?: OscillatorNode;
  lfoGain?: GainNode;
  noiseSource?: AudioBufferSourceNode;
  noiseGain?: GainNode;
}

// Create white noise buffer (cached)
let noiseBuffer: AudioBuffer | null = null;
const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  if (!noiseBuffer || noiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds of noise
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
};

// Get note index from note name (e.g., "C4" -> 0, "C#4" -> 1, etc.)
const getNoteIndex = (note: string): number => {
  const index = PIANO_NOTES.findIndex(n => n.note === note);
  return index >= 0 ? index : 0;
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

  // Initialize AudioContext lazily (needs user interaction)
  // Initialize/resume AudioContext. Await resume to ensure iOS unlocks audio
  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.5;
      masterGainRef.current.connect(audioContextRef.current.destination);
    }

    // Resume if suspended (autoplay policy) and await it so resume() runs inside
    // the user gesture that triggered play. This is required on iOS.
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        // ignore resume failures — callers will handle absence of audio
      }
    }

    return audioContextRef.current;
  }, []);

  // Play a drum sound (or soundboard sound)
  const playDrumSound = useCallback(async (note: string, velocity: number, ctx: AudioContext, masterGain: GainNode, isSoundBoard: boolean = false) => {
    const now = ctx.currentTime;
    const noteIndex = getNoteIndex(note);
    
    // Use soundboard sounds or drum sounds based on preset
    const soundArray = isSoundBoard ? SOUNDBOARD_SOUNDS : DRUM_SOUNDS;
    const drumSound: DrumSound = soundArray[noteIndex % soundArray.length];
    
    const { baseFreq, envelope, harmonics, pitchBend, noise, vibrato } = drumSound;
    
    // Create gain node for this note's envelope
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    
    // Apply ADSR attack
    const peakGain = velocity * 0.5;
    noteGain.gain.linearRampToValueAtTime(peakGain, now + envelope.attack);
    
    // Apply decay to sustain level
    noteGain.gain.linearRampToValueAtTime(
      peakGain * envelope.sustain,
      now + envelope.attack + envelope.decay
    );
    
    noteGain.connect(masterGain);
    
    // Create oscillators for harmonics
    const oscillators: OscillatorNode[] = [];
    
    harmonics.forEach((harmonic) => {
      const osc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      osc.type = harmonic.waveform;
      
      const oscFreq = baseFreq * harmonic.freqMultiplier;
      
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
      
      // Auto-stop after envelope completes
      const totalTime = envelope.attack + envelope.decay + envelope.release + 0.1;
      osc.stop(now + totalTime);
      
      oscillators.push(osc);
    });
    
    // Create vibrato LFO if specified
    let lfoOsc: OscillatorNode | undefined;
    let lfoGain: GainNode | undefined;
    
    if (vibrato) {
      lfoOsc = ctx.createOscillator();
      lfoGain = ctx.createGain();
      
      lfoOsc.type = 'sine';
      lfoOsc.frequency.value = vibrato.rate;
      
      // Set LFO depth (starts at 0 if there's a delay)
      if (vibrato.delay > 0) {
        lfoGain.gain.setValueAtTime(0, now);
        lfoGain.gain.linearRampToValueAtTime(vibrato.depth, now + vibrato.delay);
      } else {
        lfoGain.gain.value = vibrato.depth;
      }
      
      lfoOsc.connect(lfoGain);
      
      // Connect LFO to all oscillator detune parameters
      oscillators.forEach(osc => {
        lfoGain!.connect(osc.detune);
      });
      
      lfoOsc.start(now);
      
      // Auto-stop LFO after envelope completes
      const totalTime = envelope.attack + envelope.decay + envelope.release + 0.1;
      lfoOsc.stop(now + totalTime);
    }
    
    // Add noise if specified (for snares, hi-hats, etc.)
    let noiseSource: AudioBufferSourceNode | undefined;
    let noiseGainNode: GainNode | undefined;
    
    if (noise) {
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = getNoiseBuffer(ctx);
      
      noiseGainNode = ctx.createGain();
      noiseGainNode.gain.setValueAtTime(noise.gain * velocity, now);
      noiseGainNode.gain.exponentialRampToValueAtTime(0.001, now + noise.decay);
      
      // Highpass filter for noise (makes it more crispy)
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 2000;
      
      noiseSource.connect(highpass);
      highpass.connect(noiseGainNode);
      noiseGainNode.connect(masterGain);
      
      noiseSource.start(now);
      noiseSource.stop(now + noise.decay + 0.1);
    }
    
    // Store active note
    activeNotesRef.current.set(note, {
      oscillators,
      gainNode: noteGain,
      lfoOsc,
      lfoGain,
      noiseSource,
      noiseGain: noiseGainNode,
    });
    
    // Auto-cleanup after sound finishes
    const totalTime = envelope.attack + envelope.decay + envelope.release + 0.2;
    setTimeout(() => {
      activeNotesRef.current.delete(note);
    }, totalTime * 1000);
  }, []);

  // Play a note with velocity (0-1)
  const playNote = useCallback(async (note: string, frequency: number, velocity: number = 0.7) => {
    const ctx = await getAudioContext();
    const masterGain = masterGainRef.current!;
    const now = ctx.currentTime;
    
    // Get the current sound preset
    const preset: SoundPreset = SOUND_TYPES[soundTypeRef.current] || SOUND_TYPES.piano;
    
    // Handle drum kit mode (includes soundboard)
    if (preset.isDrumKit) {
      // Stop any existing instance of this note
      if (activeNotesRef.current.has(note)) {
        stopNote(note);
      }
      // playDrumSound is async but we don't need to await it here; resume() is
      // already awaited above via getAudioContext so oscillators will play.
      void playDrumSound(note, velocity, ctx, masterGain, preset.isSoundBoard === true);
      return;
    }
    
    const { envelope, harmonics, pitchBend, vibrato, frequencyShift } = preset;
    
    // Stop any existing instance of this note
    if (activeNotesRef.current.has(note)) {
      stopNote(note);
    }
    
    // Apply frequency shift if specified (in semitones)
    let baseFrequency = frequency;
    if (frequencyShift) {
      baseFrequency = frequency * Math.pow(2, frequencyShift / 12);
    }
    
    // Create gain node for this note's envelope
    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, now);
    
    // Apply ADSR attack
    const peakGain = velocity * 0.4; // Scale velocity to reasonable volume
    noteGain.gain.linearRampToValueAtTime(peakGain, now + envelope.attack);
    
    // Apply decay to sustain level
    noteGain.gain.linearRampToValueAtTime(
      peakGain * envelope.sustain,
      now + envelope.attack + envelope.decay
    );
    
    noteGain.connect(masterGain);
    
    // Create oscillators for harmonics
    const oscillators: OscillatorNode[] = [];
    
    harmonics.forEach((harmonic) => {
      const osc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      osc.type = harmonic.waveform;
      
      // Calculate initial frequency
      let oscFreq = baseFrequency * harmonic.freqMultiplier;
      
      // Apply pitch bend start if specified
      if (pitchBend) {
        osc.frequency.setValueAtTime(oscFreq * pitchBend.start, now);
        osc.frequency.linearRampToValueAtTime(oscFreq * pitchBend.end, now + pitchBend.time);
      } else {
        osc.frequency.setValueAtTime(oscFreq, now);
      }
      
      // Apply detune if specified
      if (harmonic.detune) {
        osc.detune.value = harmonic.detune;
      }
      
      harmonicGain.gain.value = harmonic.gainMultiplier;
      
      osc.connect(harmonicGain);
      harmonicGain.connect(noteGain);
      osc.start(now);
      
      oscillators.push(osc);
    });
    
    // Create vibrato LFO if specified
    let lfoOsc: OscillatorNode | undefined;
    let lfoGain: GainNode | undefined;
    
    if (vibrato) {
      lfoOsc = ctx.createOscillator();
      lfoGain = ctx.createGain();
      
      lfoOsc.type = 'sine';
      lfoOsc.frequency.value = vibrato.rate;
      
      // Set LFO depth (starts at 0 if there's a delay)
      if (vibrato.delay > 0) {
        lfoGain.gain.setValueAtTime(0, now);
        lfoGain.gain.linearRampToValueAtTime(vibrato.depth, now + vibrato.delay);
      } else {
        lfoGain.gain.value = vibrato.depth;
      }
      
      lfoOsc.connect(lfoGain);
      
      // Connect LFO to all oscillator detune parameters
      oscillators.forEach(osc => {
        lfoGain!.connect(osc.detune);
      });
      
      lfoOsc.start(now);
    }
    
    // Store active note
    activeNotesRef.current.set(note, {
      oscillators,
      gainNode: noteGain,
      lfoOsc,
      lfoGain,
    });
  }, [getAudioContext, playDrumSound]);

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
    
    // For drum sounds, just let them decay naturally
    if (preset.isDrumKit) {
      activeNotesRef.current.delete(note);
      return;
    }
    
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
        audioContextRef.current.close();
      }
    };
  }, [stopNote]);

  return { playNote, stopNote };
};
