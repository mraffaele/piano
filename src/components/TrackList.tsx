import React from 'react';
import { Track } from '../hooks/useRecorder';
import './TrackList.css';

interface TrackListProps {
  tracks: Track[];
  activeTrackId: string | null;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onStop: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  activeTrackId,
  isPlaying,
  onPlay,
  onStop,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleStartEdit = (track: Track) => {
    setEditingId(track.id);
    setEditName(track.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  if (tracks.length === 0) {
    return null;
  }

  return (
    <div className="track-list">
      <div className="track-list-header">Saved Tracks</div>
      <div className="track-list-items">
        {tracks.map(track => (
          <div 
            key={track.id} 
            className={`track-item ${activeTrackId === track.id ? 'active' : ''}`}
          >
            {editingId === track.id ? (
              <input
                ref={inputRef}
                type="text"
                className="track-name-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => handleSaveEdit(track.id)}
                onKeyDown={e => handleKeyDown(e, track.id)}
              />
            ) : (
              <span 
                className="track-name"
                onDoubleClick={() => handleStartEdit(track)}
                title="Double-click to rename"
              >
                {track.name}
              </span>
            )}
            
            <span className="track-duration">{formatDuration(track.duration)}</span>
            
            <div className="track-actions">
              {activeTrackId === track.id && isPlaying ? (
                <button 
                  className="track-btn stop"
                  onClick={onStop}
                  title="Stop"
                >
                  <span className="stop-icon"></span>
                </button>
              ) : (
                <button 
                  className="track-btn play"
                  onClick={() => onPlay(track.id)}
                  title="Play"
                >
                  <span className="play-icon"></span>
                </button>
              )}
              
              <button 
                className="track-btn delete"
                onClick={() => onDelete(track.id)}
                title="Delete"
              >
                <span className="delete-icon"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
