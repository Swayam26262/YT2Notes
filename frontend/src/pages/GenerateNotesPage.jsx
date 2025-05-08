import React, { useState, useEffect } from 'react';
import YouTubeInput from '../components/YouTubeInput';
import NotesDisplay from '../components/NotesDisplay';
import { useNavigate } from 'react-router-dom';
import { generateNotes } from '../api';
import { getAccessToken } from '../utils/tokenStorage';

const GenerateNotesPage = () => {
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check token on component mount
    const token = getAccessToken();
    if (!token) {
      setError('Not logged in. Please log in to generate notes.');
    }
  }, []);

  const handleNotesGenerated = (notes) => {
    setGeneratedNotes(notes);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setGeneratedNotes(null);
  };

  const handleViewAllNotes = () => {
    navigate('/notes');
  };

  // Keep test connection function for debugging through console only
  const testConnection = async () => {
    console.log('Testing connection...');
    
    try {
      // Try a direct test with a test YouTube link
      const token = getAccessToken();
      if (!token) {
        console.log('Error: No authentication token found');
        return;
      }
      
      // Use import.meta.env for Vite environment variables
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log(`Using API base URL: ${baseUrl}`);
      
      // Test 1: Basic ping (no auth)
      try {
        console.log('Testing basic server connectivity...');
        const pingResponse = await fetch(`${baseUrl}/api/ping/`);
        
        if (!pingResponse.ok) {
          console.log(`Basic server ping failed with status: ${pingResponse.status}. Server may be down or unreachable.`);
          return;
        }
        
        const pingData = await pingResponse.json();
        console.log(`Server ping successful! Response:`, pingData);
        
        // Test 2: Auth test
        console.log('Testing authentication...');
        const authResponse = await fetch(`${baseUrl}/api/auth-test/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!authResponse.ok) {
          console.log(`Authentication test failed with status: ${authResponse.status}. Your token may be invalid.`);
          return;
        }
        
        const authData = await authResponse.json();
        console.log(`Authentication successful! Logged in as:`, authData.user);
        
        // Test 3: Test YouTube processing with a test link
        console.log('Testing YouTube processing with a test link...');
        const testLink = 'test-youtube-link';
        
        const ytResponse = await fetch(`${baseUrl}/api/notes/generate/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ link: testLink })
        });
        
        if (!ytResponse.ok) {
          let errorMessage = `YouTube test failed with status: ${ytResponse.status}`;
          try {
            const errorData = await ytResponse.json();
            errorMessage += `. Error:`;
            console.log(errorMessage, errorData);
          } catch (e) {
            // If not JSON
            const textResponse = await ytResponse.text().catch(() => 'No text response');
            console.log(errorMessage + `. Response:`, textResponse);
          }
          return;
        }
        
        const ytData = await ytResponse.json();
        console.log(`YouTube test successful! Response:`, ytData);
        
      } catch (error) {
        console.log(`Test failed:`, error.message);
        console.error("Connection test error:", error);
      }
    } catch (e) {
      console.log(`Test failed:`, e.message);
      console.error("Connection test outer error:", e);
    }
  };

  return (
    <div className="generate-notes-page">
      <div className="page-header">
        <h1>Generate Notes from YouTube</h1>
        <p>Enter a YouTube URL below to automatically generate detailed notes.</p>
      </div>

      <YouTubeInput 
        onNotesGenerated={handleNotesGenerated} 
        onError={handleError} 
      />

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {generatedNotes && (
        <div className="notes-result-container">
          <NotesDisplay notes={generatedNotes} />
        </div>
      )}

      <div className="notes-navigation">
        <button onClick={handleViewAllNotes} className="view-all-btn">
          View All Your Notes
        </button>
      </div>
    </div>
  );
};

export default GenerateNotesPage; 