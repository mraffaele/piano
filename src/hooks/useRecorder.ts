import { useState, useCallback, useRef, useEffect } from 'react';

interface NoteEvent {
  type: 'start' | 'end';
  note: string;
  frequency: number;
  velocity: number;
  timestamp: number; // relative to recording start
}

export interface Track {
  id: string;
  name: string;
  events: NoteEvent[];
  createdAt: number;
  duration: number;
  soundType: string;
}

export type RecorderState = 'idle' | 'recording' | 'playing';

const STORAGE_KEY = 'piano-tracks';

const generateId = () => Math.random().toString(36).substring(2, 9);

const loadTracksFromStorage = (): Track[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTracksToStorage = (tracks: Track[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  } catch {
    // Storage full or unavailable
  }
};

interface UseRecorderReturn {
  state: RecorderState;
  tracks: Track[];
  activeTrackId: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  saveTrack: (name?: string, soundType?: string) => void;
  deleteTrack: (id: string) => void;
  renameTrack: (id: string, name: string) => void;
  playTrack: (
    id: string,
    playNote: (note: string, frequency: number, velocity: number) => void,
    stopNote: (note: string) => void
  ) => void;
  stopPlayback: () => void;
  recordNoteStart: (note: string, frequency: number, velocity: number) => void;
  recordNoteEnd: (note: string, frequency: number) => void;
  clearCurrentRecording: () => void;
  hasCurrentRecording: boolean;
}

export const useRecorder = (): UseRecorderReturn => {
  const [state, setState] = useState<RecorderState>('idle');
  const [currentEvents, setCurrentEvents] = useState<NoteEvent[]>([]);
  const [tracks, setTracks] = useState<Track[]>(loadTracksFromStorage);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  
  const recordingStartTime = useRef<number>(0);
  const playbackTimeouts = useRef<number[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  // Persist tracks to localStorage
  useEffect(() => {
    saveTracksToStorage(tracks);
  }, [tracks]);

  const startRecording = useCallback(() => {
    setCurrentEvents([]);
    setActiveTrackId(null);
    recordingStartTime.current = performance.now();
    setState('recording');
  }, []);

  const stopRecording = useCallback(() => {
    setState('idle');
  }, []);

  const saveTrack = useCallback((name?: string, soundType: string = 'piano') => {
    if (currentEvents.length === 0) return;
    if (tracks.length >= 3) return; // Cap at 3 tracks
    
    const lastEvent = currentEvents[currentEvents.length - 1];
    const trackNumber = tracks.length + 1;
    
    const newTrack: Track = {
      id: generateId(),
      name: name || `Track ${trackNumber}`,
      events: [...currentEvents],
      createdAt: Date.now(),
      duration: lastEvent.timestamp,
      soundType,
    };
    
    setTracks(prev => [...prev, newTrack]);
    setCurrentEvents([]);
  }, [currentEvents, tracks.length]);

  const deleteTrack = useCallback((id: string) => {
    if (activeTrackId === id) {
      playbackTimeouts.current.forEach(tid => clearTimeout(tid));
      playbackTimeouts.current = [];
      isPlayingRef.current = false;
      setActiveTrackId(null);
      setState('idle');
    }
    setTracks(prev => prev.filter(t => t.id !== id));
  }, [activeTrackId]);

  const renameTrack = useCallback((id: string, name: string) => {
    setTracks(prev => prev.map(t => 
      t.id === id ? { ...t, name } : t
    ));
  }, []);

  const stopPlayback = useCallback(() => {
    playbackTimeouts.current.forEach(id => clearTimeout(id));
    playbackTimeouts.current = [];
    isPlayingRef.current = false;
    setActiveTrackId(null);
    setState('idle');
  }, []);

  const recordNoteStart = useCallback((note: string, frequency: number, velocity: number) => {
    if (state !== 'recording') return;
    
    const timestamp = performance.now() - recordingStartTime.current;
    setCurrentEvents(prev => [...prev, {
      type: 'start',
      note,
      frequency,
      velocity,
      timestamp,
    }]);
  }, [state]);

  const recordNoteEnd = useCallback((note: string, frequency: number) => {
    if (state !== 'recording') return;
    
    const timestamp = performance.now() - recordingStartTime.current;
    setCurrentEvents(prev => [...prev, {
      type: 'end',
      note,
      frequency,
      velocity: 0,
      timestamp,
    }]);
  }, [state]);

  const scheduleLoop = useCallback((
    events: NoteEvent[],
    playNote: (note: string, frequency: number, velocity: number) => void,
    stopNote: (note: string) => void
  ) => {
    playbackTimeouts.current.forEach(id => clearTimeout(id));
    playbackTimeouts.current = [];

    events.forEach(event => {
      const timeoutId = window.setTimeout(() => {
        if (event.type === 'start') {
          playNote(event.note, event.frequency, event.velocity);
        } else {
          stopNote(event.note);
        }
      }, event.timestamp);
      
      playbackTimeouts.current.push(timeoutId);
    });

    const lastEvent = events[events.length - 1];
    const loopDuration = lastEvent.timestamp + 300;
    
    const loopTimeout = window.setTimeout(() => {
      if (isPlayingRef.current) {
        scheduleLoop(events, playNote, stopNote);
      }
    }, loopDuration);
    
    playbackTimeouts.current.push(loopTimeout);
  }, []);

  const playTrack = useCallback((
    id: string,
    playNote: (note: string, frequency: number, velocity: number) => void,
    stopNote: (note: string) => void
  ) => {
    const track = tracks.find(t => t.id === id);
    if (!track || track.events.length === 0) return;
    
    // Stop any current playback first
    playbackTimeouts.current.forEach(tid => clearTimeout(tid));
    playbackTimeouts.current = [];
    
    setState('playing');
    setActiveTrackId(id);
    isPlayingRef.current = true;
    
    scheduleLoop(track.events, playNote, stopNote);
  }, [tracks, scheduleLoop]);

  const clearCurrentRecording = useCallback(() => {
    setCurrentEvents([]);
  }, []);

  return {
    state,
    tracks,
    activeTrackId,
    startRecording,
    stopRecording,
    saveTrack,
    deleteTrack,
    renameTrack,
    playTrack,
    stopPlayback,
    recordNoteStart,
    recordNoteEnd,
    clearCurrentRecording,
    hasCurrentRecording: currentEvents.length > 0,
  };
};
