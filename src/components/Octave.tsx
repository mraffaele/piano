import React from 'react';
import { Key } from './Key';
import { NoteInfo } from '../utils/noteFrequencies';
import './Octave.css';

interface OctaveProps {
  notes: NoteInfo[];
  pressedNotes: Set<string>;
  mouseHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseEnter: (e: React.MouseEvent) => void;
    onMouseLeave: () => void;
  };
}

// Black key positions relative to white keys (0-indexed from C)
// C# between C(0) and D(1), D# between D(1) and E(2), etc.
const BLACK_KEY_POSITIONS: Record<string, number> = {
  'C#': 0.65,  // After C
  'D#': 1.65,  // After D
  'F#': 3.65,  // After F
  'G#': 4.65,  // After G
  'A#': 5.65,  // After A
};

export const Octave: React.FC<OctaveProps> = ({
  notes,
  pressedNotes,
  mouseHandlers,
}) => {
  const whiteNotes = notes.filter(n => !n.isBlack);
  const blackNotes = notes.filter(n => n.isBlack);
  
  const whiteKeyWidth = 100 / whiteNotes.length;

  return (
    <div className="octave">
      {/* White keys */}
      {whiteNotes.map((noteInfo) => (
        <Key
          key={noteInfo.note}
          note={noteInfo.note}
          isBlack={false}
          isPressed={pressedNotes.has(noteInfo.note)}
          {...mouseHandlers}
        />
      ))}
      
      {/* Black keys - positioned absolutely */}
      {blackNotes.map((noteInfo) => {
        const noteName = noteInfo.note.replace(/\d+$/, '');
        const position = BLACK_KEY_POSITIONS[noteName];
        
        return (
          <div
            key={noteInfo.note}
            className="black-key-wrapper"
            style={{
              left: `${position * whiteKeyWidth}%`,
              width: `${whiteKeyWidth * 0.65}%`,
            }}
          >
            <Key
              note={noteInfo.note}
              isBlack={true}
              isPressed={pressedNotes.has(noteInfo.note)}
              {...mouseHandlers}
            />
          </div>
        );
      })}
    </div>
  );
};
