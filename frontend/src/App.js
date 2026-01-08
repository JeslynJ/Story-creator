// frontend/src/App.js
import React, { useState } from 'react';
import './App.css';
import ModeSelector from './components/ModeSelector';
import StoryEditor from './components/StoryEditor';

function App() {
  const [mode, setMode] = useState(null);
  const [outputFormat, setOutputFormat] = useState('text');
  const [story, setStory] = useState([]);
  const [currentScene, setCurrentScene] = useState('');

  const handleStart = (selectedMode, selectedFormat) => {
    setMode(selectedMode);
    setOutputFormat(selectedFormat);
  };

  const handleReset = () => {
    setMode(null);
    setOutputFormat('text');
    setStory([]);
    setCurrentScene('');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1> TaleTeller</h1>
        <p>The story Co writer</p>
      </header>

      {!mode ? (
        <ModeSelector onStart={handleStart} />
      ) : (
        <StoryEditor
          mode={mode}
          outputFormat={outputFormat}
          story={story}
          setStory={setStory}
          currentScene={currentScene}
          setCurrentScene={setCurrentScene}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

export default App;