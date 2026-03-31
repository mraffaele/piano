import React from 'react';
import { RecorderState } from '../hooks/useRecorder';
import './RecordingControls.css';

interface RecordingControlsProps {
  state: RecorderState;
  hasCurrentRecording: boolean;
  onRecord: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
}

export const RecordingControls: React.FC<RecordingControlsProps> = ({
  state,
  hasCurrentRecording,
  onRecord,
  onStop,
  onSave,
  onClear,
}) => {
  return (
    <div className="recording-controls">
      {state === 'idle' && (
        <>
          <button 
            className="control-btn record-btn"
            onClick={onRecord}
            title="Record"
          >
            <span className="record-icon"></span>
          </button>
          
          {hasCurrentRecording && (
            <>
              <button 
                className="control-btn save-btn"
                onClick={onSave}
                title="Save Track"
              >
                <span className="save-icon"></span>
              </button>
              
              <button 
                className="control-btn clear-btn"
                onClick={onClear}
                title="Discard"
              >
                <span className="clear-icon"></span>
              </button>
            </>
          )}
        </>
      )}
      
      {state === 'recording' && (
        <button 
          className="control-btn stop-btn recording"
          onClick={onStop}
          title="Stop Recording"
        >
          <span className="stop-icon"></span>
        </button>
      )}
      
      {state === 'playing' && (
        <button 
          className="control-btn stop-btn"
          onClick={onStop}
          title="Stop Playback"
        >
          <span className="stop-icon"></span>
        </button>
      )}
      
      {state === 'recording' && (
        <span className="recording-indicator">REC</span>
      )}
      
      {state === 'playing' && (
        <span className="playing-indicator">LOOPING</span>
      )}
      
      {state === 'idle' && hasCurrentRecording && (
        <span className="unsaved-indicator">UNSAVED</span>
      )}
    </div>
  );
};
