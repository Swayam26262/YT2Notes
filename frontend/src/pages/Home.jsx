import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAccessToken } from '../utils/tokenStorage';
import { useNavigate, Link } from 'react-router-dom';
import { getUserNotes } from '../api';

const Home = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentNotes, setRecentNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const navigate = useNavigate();

  // Load recent notes on component mount
  useEffect(() => {
    const fetchRecentNotes = async () => {
      try {
        setLoadingNotes(true);
        const notes = await getUserNotes();
        setRecentNotes(notes.slice(0, 3)); // Just show the 3 most recent notes
      } catch (err) {
        console.error('Error fetching recent notes:', err);
      } finally {
        setLoadingNotes(false);
      }
    };
    
    fetchRecentNotes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setError('');
    
    console.log('Processing URL:', url);
    
    // Check auth token
    const token = getAccessToken();
    if (!token) {
      setError('Please log in to generate notes');
      setIsLoading(false);
      return;
    }
    
    try {
      // Get the base URL from environment variables
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log(`Using API at: ${baseUrl}`);
      
      // Make the actual API request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout
      
      console.log('Sending request to:', `${baseUrl}/api/notes/generate/`);
      console.log('With payload:', { link: url });
      
      try {
        const response = await fetch(`${baseUrl}/api/notes/generate/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ link: url }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        if (!response.ok) {
          let errorMessage = `Error: ${response.status}`;
          try {
            const errorData = await response.json();
            console.log('Error response data:', errorData);
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          } catch (e) {
            // If not JSON
            const errorText = await response.text().catch(() => 'Unknown error');
            console.log('Error response text:', errorText);
            errorMessage += ` - ${errorText}`;
          }
          throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log('Success! Notes generated:', result);
        
        // After success, refresh notes and navigate to the note detail
        if (result.id) {
          navigate(`/notes/${result.id}`);
        } else {
          // If for some reason no ID is returned, just reload the current page
          window.location.reload();
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out after 60 seconds. The server might be busy or down.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Error generating notes:', err);
      setError(`Failed to generate notes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAllNotes = () => {
    navigate('/notes');
  };

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto my-6 sm:my-16 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-8 mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center">Generate Notes from YouTube</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="youtube-url" className="block text-base sm:text-lg font-medium mb-2 sm:mb-3">
                YouTube Video URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-base sm:text-lg border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !url}
                  className={`mt-2 sm:mt-0 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : 'Convert'}
                </button>
              </div>
              
              <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                Paste any valid YouTube video URL to generate notes
              </p>
              
              {error && (
                <div className="mt-3 text-red-500 text-sm sm:text-base py-2 px-3 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded">
                  {error}
                </div>
              )}
              
              {isLoading && (
                <div className="mt-5 text-center">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                  <p className="mt-3 text-gray-600 dark:text-gray-400">
                    Generating notes... This may take a few minutes depending on the video length.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Recent Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Your Recent Notes</h2>
            <button 
              onClick={handleViewAllNotes}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View All
            </button>
          </div>
          
          {loadingNotes ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-r-transparent"></div>
            </div>
          ) : recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map(note => (
                <Link 
                  key={note.id} 
                  to={`/notes/${note.id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h3 className="font-medium text-lg mb-2 truncate">{note.youtube_title}</h3>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p>You haven't created any notes yet.</p>
              <p className="mt-2">Paste a YouTube URL above to get started!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;