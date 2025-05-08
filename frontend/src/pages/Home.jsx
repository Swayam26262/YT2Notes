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
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Notes</h3>
          
          <div className="text-center py-8 sm:py-16 text-gray-500 dark:text-gray-400">
            <p className="text-base sm:text-lg">You haven't generated any notes yet.</p>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg">Enter a YouTube URL above to get started!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;