import React from 'react';
import './Key.css';

interface KeyProps {
  note: string;
  isBlack: boolean;
  isPressed: boolean;
  registerKeyRef?: (note: string, el: HTMLElement | null) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

export const Key: React.FC<KeyProps> = ({
  note,
  isBlack,
  isPressed,
  registerKeyRef,
  onMouseDown,
  onMouseUp,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Get display label (note without octave number for black keys)
  const displayNote = note.replace(/\d+$/, '');
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    registerKeyRef?.(note, ref.current);
    return () => registerKeyRef?.(note, null);
  }, [note, registerKeyRef]);
  
  return (
    <div
      ref={ref}
      className={`key ${isBlack ? 'black-key' : 'white-key'} ${isPressed ? 'pressed' : ''}`}
      data-note={note}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="key-label">{displayNote}</span>
    </div>
  );
};
