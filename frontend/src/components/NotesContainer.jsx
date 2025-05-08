import React, { useState, useEffect } from 'react';
import UrlInput from './UrlInput';
import NotesDisplay from './NotesDisplay';
import SavedNotes from './SavedNotes';
import { getSavedNotes, saveNotes, removeNotes } from '../utils/localStorage';
import { generateNotes } from '../utils/api';

const NotesContainer = () => {
  const [notes, setNotes] = useState([]);
  const [currentNotes, setCurrentNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load saved notes from localStorage on initial render
    setNotes(getSavedNotes());
  }, []);

  const handleGenerate = async (videoUrl) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we already have this URL in our notes
      const existingNotes = notes.find(n => n.videoUrl === videoUrl);
      
      if (existingNotes) {
        setCurrentNotes(existingNotes);
        setLoading(false);
        return;
      }
      
      // Call API to get notes
      const result = await generateNotes(videoUrl);
      
      // Create new notes object
      const newNotes = {
        id: Date.now().toString(),
        videoUrl,
        videoTitle: result.title,
        content: result.content,
        thumbnailUrl: result.thumbnailUrl,
        createdAt: new Date().toISOString()
      };
      
      // Update state
      setCurrentNotes(newNotes);
      
      // Save to localStorage and update notes list
      const updatedNotes = saveNotes(newNotes);
      setNotes(updatedNotes);
      
    } catch (err) {
      setError('Failed to generate notes. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotes = (id) => {
    const updatedNotes = removeNotes(id);
    setNotes(updatedNotes);
    
    // If the deleted notes is the current one, clear it
    if (currentNotes && currentNotes.id === id) {
      setCurrentNotes(null);
    }
  };
  
  const handleViewNotes = (notes) => {
    setCurrentNotes(notes);
  };

  return (
    <div className="space-y-8">
      <UrlInput onSummarize={handleGenerate} isLoading={loading} />
      
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}
      
      {currentNotes && (
        <NotesDisplay 
          notes={currentNotes} 
          isLoading={loading} 
        />
      )}
      
      <SavedNotes
        notes={notes}
        onDelete={handleDeleteNotes}
        onView={handleViewNotes}
        activeNotesId={currentNotes?.id}
      />
    </div>
  );
};

export default NotesContainer; 