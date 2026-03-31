import { useCallback, useRef } from 'react';

interface TouchState {
  note: string;
  touchId: number;
}

interface UseTouchHandlerProps {
  onNoteStart: (note: string, velocity: number) => void;
  onNoteEnd: (note: string) => void;
}

// Calculate velocity based on vertical touch position on key
// Higher on key (lower Y relative to element) = softer (lower velocity)
// Lower on key (higher Y relative to element) = louder (higher velocity)
const calculateVelocity = (
  touchY: number,
  elementTop: number,
  elementHeight: number
): number => {
  const relativeY = touchY - elementTop;
  const normalizedPosition = Math.max(0, Math.min(1, relativeY / elementHeight));
  
  // Map position to velocity: top = 0.2 (soft), bottom = 1.0 (loud)
  const minVelocity = 0.2;
  const maxVelocity = 1.0;
  
  return minVelocity + normalizedPosition * (maxVelocity - minVelocity);
};

export const useTouchHandler = ({ onNoteStart, onNoteEnd }: UseTouchHandlerProps) => {
  // Track active touches to support multi-touch
  const activeTouchesRef = useRef<Map<number, TouchState>>(new Map());

  // Get note info from element
  const getNoteFromElement = (element: Element | null): string | null => {
    if (!element) return null;
    
    // Traverse up to find the key element with data-note attribute
    let current: Element | null = element;
    while (current) {
      const note = current.getAttribute('data-note');
      if (note) return note;
      current = current.parentElement;
    }
    
    return null;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const note = getNoteFromElement(element);
      
      if (note && element) {
        const rect = element.getBoundingClientRect();
        const velocity = calculateVelocity(touch.clientY, rect.top, rect.height);
        
        activeTouchesRef.current.set(touch.identifier, { note, touchId: touch.identifier });
        onNoteStart(note, velocity);
      }
    }
  }, [onNoteStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const element = document.elementFromPoint(touch.clientX, touch.clientY);
      const newNote = getNoteFromElement(element);
      const touchState = activeTouchesRef.current.get(touch.identifier);
      
      if (touchState) {
        // If moved to a different key
        if (newNote !== touchState.note) {
          // End the old note
          onNoteEnd(touchState.note);
          
          if (newNote && element) {
            // Start the new note
            const rect = element.getBoundingClientRect();
            const velocity = calculateVelocity(touch.clientY, rect.top, rect.height);
            
            activeTouchesRef.current.set(touch.identifier, { note: newNote, touchId: touch.identifier });
            onNoteStart(newNote, velocity);
          } else {
            // Moved off all keys
            activeTouchesRef.current.delete(touch.identifier);
          }
        }
      } else if (newNote && element) {
        // New touch moved onto a key
        const rect = element.getBoundingClientRect();
        const velocity = calculateVelocity(touch.clientY, rect.top, rect.height);
        
        activeTouchesRef.current.set(touch.identifier, { note: newNote, touchId: touch.identifier });
        onNoteStart(newNote, velocity);
      }
    }
  }, [onNoteStart, onNoteEnd]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const touchState = activeTouchesRef.current.get(touch.identifier);
      
      if (touchState) {
        onNoteEnd(touchState.note);
        activeTouchesRef.current.delete(touch.identifier);
      }
    }
  }, [onNoteEnd]);

  // Mouse support for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const element = e.target as Element;
    const note = getNoteFromElement(element);
    
    if (note) {
      const rect = element.getBoundingClientRect();
      const velocity = calculateVelocity(e.clientY, rect.top, rect.height);
      
      activeTouchesRef.current.set(-1, { note, touchId: -1 });
      onNoteStart(note, velocity);
    }
  }, [onNoteStart]);

  const handleMouseUp = useCallback(() => {
    const touchState = activeTouchesRef.current.get(-1);
    if (touchState) {
      onNoteEnd(touchState.note);
      activeTouchesRef.current.delete(-1);
    }
  }, [onNoteEnd]);

  const handleMouseLeave = useCallback(() => {
    const touchState = activeTouchesRef.current.get(-1);
    if (touchState) {
      onNoteEnd(touchState.note);
      activeTouchesRef.current.delete(-1);
    }
  }, [onNoteEnd]);

  const handleMouseEnter = useCallback((e: React.MouseEvent) => {
    // Only trigger if mouse button is pressed
    if (e.buttons !== 1) return;
    
    const element = e.target as Element;
    const note = getNoteFromElement(element);
    
    if (note) {
      const rect = element.getBoundingClientRect();
      const velocity = calculateVelocity(e.clientY, rect.top, rect.height);
      
      activeTouchesRef.current.set(-1, { note, touchId: -1 });
      onNoteStart(note, velocity);
    }
  }, [onNoteStart]);

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
    mouseHandlers: {
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
      onMouseEnter: handleMouseEnter,
    },
  };
};
