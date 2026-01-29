// frontend/src/components/StoryEditor.js
import React, { useState } from 'react';
import axios from 'axios';
import './StoryEditor.css';
import { jsPDF } from 'jspdf';

const API_URL = 'http://localhost:5000/api';

const StoryEditor = ({ mode, outputFormat, story, setStory, currentScene, setCurrentScene, onReset }) => {
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState(null);
  const [showChoices, setShowChoices] = useState(false);
  const [editingSceneId, setEditingSceneId] = useState(null);
  const [editedText, setEditedText] = useState('');


  const handleGrammarCheck = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/grammar-check`, {
        text: inputText,
        mode: mode
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error checking grammar:', error);
      alert('Failed to check grammar. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScene = (sceneId) => {
    const updatedStory = story.filter(scene => scene.id !== sceneId);
    setStory(updatedStory);

    // if currently editing the deleted scene, reset edit state
    if (editingSceneId === sceneId) {
      setEditingSceneId(null);
      setEditedText('');
    }
  };

  const handleAcceptSuggestion = () => {
    if (suggestions && suggestions.improvedVersion) {
      setInputText(suggestions.improvedVersion);
      setSuggestions(null);
    }
  };

  const handleAddToStory = () => {
    if (!inputText.trim()) return;

    const newScene = {
      id: Date.now(),
      text: inputText,
      timestamp: new Date().toISOString()
    };
    

    setStory([...story, newScene]);
    setCurrentScene(inputText);
    setInputText('');
    setSuggestions(null);
  };

  const handleGenerateChoices = async () => {
    if (story.length === 0) {
      alert('Please add at least one scene first!');
      return;
    }

    setLoading(true);
    setShowChoices(true);
    try {
      const storyContext = story.map(s => s.text).join('\n\n');
      const response = await axios.post(`${API_URL}/generate-choices`, {
        storyContext,
        mode,
        currentScene
      });
      setChoices(response.data.choices);
    } catch (error) {
      console.error('Error generating choices:', error);
      alert('Failed to generate choices. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = async (choice) => {
    setLoading(true);
    try {
      const storyContext = story.map(s => s.text).join('\n\n');
      const response = await axios.post(`${API_URL}/continue-scene`, {
        storyContext,
        mode,
        selectedChoice: choice.description
      });

      const newScene = {
        id: Date.now(),
        text: response.data.continuation,
        timestamp: new Date().toISOString(),
        fromChoice: choice.title
      };

      setStory([...story, newScene]);
      setCurrentScene(response.data.continuation);
      setShowChoices(false);
      setChoices(null);
    } catch (error) {
      console.error('Error continuing scene:', error);
      alert('Failed to continue scene. Make sure backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditScene = (scene) => {
    setEditingSceneId(scene.id);
    setEditedText(scene.text);
  };

  const handleSaveEdit = (sceneId) => {
    const updatedStory = story.map(scene =>
      scene.id === sceneId
        ? { ...scene, text: editedText }
        : scene
      );

    setStory(updatedStory);
    setEditingSceneId(null);
    setEditedText('');
  };
  


  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.text(`${mode.toUpperCase()} Story`, margin, y);
    y += 15;

    // Story content
    doc.setFontSize(12);
    story.forEach((scene, index) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Add scene divider
      doc.setFontSize(14);
      doc.text(`Scene ${index + 1}`, margin, y);
      y += 10;

      // Add scene text
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(scene.text, maxWidth);
      lines.forEach(line => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
      });
      y += 10;
    });

    doc.save(`${mode}-story.pdf`);
  };

  return (
    <div className="story-editor">
      <div className="editor-header">
        <h2>✍️ Writing in {mode.toUpperCase()} mode</h2>
        <button onClick={onReset} className="reset-button">← Back to Menu</button>
      </div>

      <div className="editor-layout">
        {/* Left: Story Draft */}
        <div className="story-draft">
          <h3> Your Story</h3>
          <div className="story-content">
            {story.length === 0 ? (
              <p className="empty-state">Your story will appear here as you write...</p>
            ) : (
              story.map((scene, index) => (
                <div key={scene.id} className="scene">
                  <div className="scene-header">
                    <span className="scene-number">Scene {index + 1}</span>
                    {scene.fromChoice && <span className="scene-choice">→ {scene.fromChoice}</span>}
                  </div>
                  {editingSceneId === scene.id ? (
                    <>
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={5}
                        style={{ width: '100%', padding: '8px' }}
                      />
                      <button
                        onClick={() => handleSaveEdit(scene.id)}
                        style={{ marginTop: '5px' }}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <p>{scene.text}</p>
                      <div className="scene-buttons">
                        <button className="scene-btn edit-btn" onClick={() => handleEditScene(scene)}>
                          Edit
                        </button>

                        <button className="scene-btn delete-btn" onClick={() => handleDeleteScene(scene.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                  </div>
              ))
            )}
          </div>
          
          {story.length > 0 && (
            <div className="story-actions">
              <button onClick={handleDownloadPDF} className="download-button">
                 Download PDF
              </button>
              <button onClick={handleGenerateChoices} className="choices-button" disabled={loading}>
                {loading ? ' Generating...' : ' Generate Plot Choices'}
              </button>
            </div>
          )}
        </div>

        {/* Right: Input & Suggestions */}
        <div className="editor-panel">
          {!showChoices ? (
            <>
              <h3> Write Scene</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Start writing your scene here..."
                className="scene-input"
                rows="10"
              />

              <div className="editor-actions">
                <button 
                  onClick={handleGrammarCheck} 
                  disabled={loading || !inputText.trim()}
                  className="check-button"
                >
                  {loading ? ' Checking...' : ' Check & Improve'}
                </button>
                <button 
                  onClick={handleAddToStory}
                  disabled={!inputText.trim()}
                  className="add-button"
                >
                   Add to Story
                </button>
              </div>

              {suggestions && (
                <div className="suggestions-panel">
                  <h4> AI Suggestions</h4>
                  {suggestions.hasIssues ? (
                    <>
                      <div className="improved-text">
                        <h5>Improved Version:</h5>
                        <p>{suggestions.improvedVersion}</p>
                      </div>
                      {suggestions.suggestions.length > 0 && (
                        <div className="suggestion-list">
                          <h5>Specific Changes:</h5>
                          {suggestions.suggestions.map((sug, idx) => (
                            <div key={idx} className="suggestion-item">
                              <p><strong>Original:</strong> {sug.original}</p>
                              <p><strong>Suggested:</strong> {sug.suggested}</p>
                              <p className="reason"><em>{sug.reason}</em></p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="suggestion-actions">
                        <button onClick={handleAcceptSuggestion} className="accept-button">
                          ✅ Accept Improvements
                        </button>
                        <button onClick={() => setSuggestions(null)} className="dismiss-button">
                          ❌ Keep Original
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="no-issues">✨ Looks great! No issues found.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="choices-panel">
              <h3> Choose Your Path</h3>
              {loading ? (
                <p className="loading">Generating choices...</p>
              ) : choices ? (
                <>
                  <div className="choices-list">
                    {choices.map((choice) => (
                      <div key={choice.id} className="choice-card" onClick={() => handleSelectChoice(choice)}>
                        <h4>Option {choice.id}: {choice.title}</h4>
                        <p>{choice.description}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowChoices(false)} className="back-button">
                    ← Back to Editor
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;