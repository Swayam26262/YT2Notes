import React, { useState } from 'react';
import Layout from '../components/Layout';

const Home = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    
    // This is just a placeholder - you would integrate with your backend here
    console.log('Processing URL:', url);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setUrl('');
      // Here you would handle the notes generation and display
    }, 1500);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto my-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Generate Notes from YouTube</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="youtube-url" className="block text-sm font-medium mb-2">
                YouTube Video URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="youtube-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading || !url}
                  className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : 'Convert'}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Paste any valid YouTube video URL to generate notes
              </p>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Notes</h3>
          
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>You haven't generated any notes yet.</p>
            <p className="mt-2">Enter a YouTube URL above to get started!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;