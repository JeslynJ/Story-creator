// frontend/src/components/ModeSelector.js
import React, { useState } from 'react';
import './ModeSelector.css';

const ModeSelector = ({ onStart }) => {
  const [selectedMode, setSelectedMode] = useState('adventure');
  const [selectedFormat, setSelectedFormat] = useState('text');

  const modes = [
    { value: 'adventure', label: ' Adventure', description: 'Epic quests and heroic journeys' },
    { value: 'horror', label: ' Horror', description: 'Spine-chilling tales of terror' },
    { value: 'fantasy', label: ' Fantasy', description: 'Magical worlds and mythical creatures' },
    { value: 'mystery', label: ' Mystery', description: 'Puzzles and detective stories' },
    { value: 'scifi', label: ' Sci-Fi', description: 'Futuristic technology and space' },
    { value: 'romance', label: ' Romance', description: 'Love stories and emotional journeys' },

  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(selectedMode, selectedFormat);
  };

  return (
    <div className="mode-selector">
      <h2>Choose Your Story Mode</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mode-grid">
          {modes.map((mode) => (
            <div
              key={mode.value}
              className={`mode-card ${selectedMode === mode.value ? 'selected' : ''}`}
              onClick={() => setSelectedMode(mode.value)}
            >
              <h3>{mode.label}</h3>
              <p>{mode.description}</p>
            </div>
          ))}
        </div>

        <div className="format-selector">
          <h3>Output Format</h3>
          <div className="format-options">
            <label className={selectedFormat === 'text' ? 'selected' : ''}>
              <input
                type="radio"
                value="text"
                checked={selectedFormat === 'text'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
               Text Only
            </label>
            <label className={selectedFormat === 'text-images' ? 'selected' : ''}>
              <input
                type="radio"
                value="text-images"
                checked={selectedFormat === 'text-images'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
               Text + Images 
            </label>
          </div>
        </div>

        <button type="submit" className="start-button">
          Start Writing →
        </button>
      </form>
    </div>
  );
};

export default ModeSelector;