import React, { useState } from 'react';
import { getAccessToken } from '../utils/tokenStorage';

const YouTubeInput = ({ onNotesGenerated, onError }) => {
  const [youtubeLink, setYoutubeLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const isValidYouTubeURL = (url) => {
    // Basic YouTube URL validation
    return url.includes('youtube.com/') || url.includes('youtu.be/');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    setError('');
    setProgress('');

    if (!youtubeLink.trim()) {
      setError('Please enter a YouTube link');
      return;
    }

    if (!isValidYouTubeURL(youtubeLink)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setIsSubmitting(true);
    setProgress('Initializing...');
    
    // Get auth token
    const token = getAccessToken();
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Properly accessing Vite environment variables
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      setProgress('Downloading video...');
      const response = await fetch(`${baseUrl}/api/notes/generate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ link: youtubeLink })
      });
      
      if (!response.ok) {
        let errorMessage = `Error generating notes (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (jsonError) {
          // If response is not JSON
          errorMessage = 'Server error. Please try again.';
        }
        
        throw new Error(errorMessage);
      }
      
      setProgress('Processing video...');
      const result = await response.json();
      
      setYoutubeLink('');
      onNotesGenerated(result);
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(`${err.message}`);
      if (onError) {
        onError(`${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
      setProgress('');
    }
  };

  return (
    <div className="youtube-input-container">
      <h2 className="text-xl font-semibold mb-4">Generate Notes from YouTube Video</h2>
      <form 
        onSubmit={handleSubmit} 
        className="youtube-form"
      >
        <div className="flex w-full gap-2">
          <input
            type="text"
            placeholder="Paste YouTube URL here"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button 
            type="submit"
            disabled={isSubmitting} 
            className="px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Processing...' : 'Generate Notes'}
          </button>
        </div>
        {error && <p className="mt-2 text-red-600 font-medium whitespace-pre-line">{error}</p>}
        {isSubmitting && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 mb-2">{progress}</p>
            <p className="text-gray-600 mb-3">For longer videos (over 30 minutes), this process may take several minutes. Please be patient.</p>
            <div className="mt-3 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          </div>
        )}
      </form>
    </div>
  );
};

export default YouTubeInput; 