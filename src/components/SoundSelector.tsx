import React, { useState } from "react";
import {
  SOUND_TYPES,
  SOUND_CATEGORIES,
  CATEGORY_NAMES,
} from "../utils/soundTypes";
import "./SoundSelector.css";

interface SoundSelectorProps {
  currentSound: string;
  onSoundChange: (sound: string) => void;
}

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  currentSound,
  onSoundChange,
}) => {
  const [isMinimised, setIsMinimised] = useState(true);
  return null;
  return (
    <>
      <button
        className={`sound-minimise ${isMinimised ? "" : "minimised"}`}
        onClick={() => setIsMinimised(!isMinimised)}
      >
        🎛
      </button>
      {!isMinimised && (
        <div className="sound-selector">
          {Object.entries(SOUND_CATEGORIES).map(([category, sounds]) => (
            <div key={category} className="sound-category">
              {/* <div className="category-label">{CATEGORY_NAMES[category]}</div> */}
              <div className="sound-buttons">
                {sounds.map((soundId) => {
                  const sound = SOUND_TYPES[soundId];
                  const isActive = currentSound === soundId;
                  return (
                    <button
                      key={soundId}
                      className={`sound-btn ${isActive ? "active" : ""}`}
                      onClick={() => onSoundChange(soundId)}
                      title={sound.name}
                    >
                      <span className="sound-emoji">{sound.emoji}</span>
                      <span className="sound-name">{sound.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
