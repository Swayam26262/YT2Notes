import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoteDetails, deleteNote } from '../api';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import { convertMarkdownToHtml } from '../utils/markdownConverter';

const NoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    fetchNoteDetails();
  }, [id]);

  const fetchNoteDetails = async () => {
    try {
      setLoading(true);
      const data = await getNoteDetails(id);
      setNote(data);
      setError('');
    } catch (err) {
      console.error('Error fetching note details:', err);
      setError('Failed to load note details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        navigate('/notes');
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mr-3"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Loading note details...</p>
        </div>
      );
    }

    if (!note) {
      return (
        <div className="text-center py-16 px-4">
          <svg className="h-16 w-16 mx-auto text-red-500 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="text-2xl font-bold mb-4">Note not found</h2>
          <p className={`text-lg mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
          <button 
            onClick={handleBack} 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return (
      <>
        <div className={`mb-6 p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">{note.youtube_title}</h1>
            <div className="flex items-center gap-2">
              <a 
                href={note.youtube_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                Watch Original Video
              </a>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Created: {new Date(note.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button 
              onClick={() => window.print()} 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Notes
            </button>
            <button 
              onClick={handleDelete} 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-800/50 dark:text-red-400 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete Notes
            </button>
          </div>
        </div>

        <div className={`mb-8 p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">Notes</h2>
          <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
            <div dangerouslySetInnerHTML={{ 
              __html: convertMarkdownToHtml(note.notes_content)
            }} />
          </div>
        </div>

        <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <button 
            onClick={() => setShowTranscript(!showTranscript)} 
            className={`w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition-colors ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span className="font-medium">
              {showTranscript ? 'Hide Transcript' : 'Show Full Transcript'}
            </span>
            <svg 
              className={`h-5 w-5 transition-transform ${showTranscript ? 'transform rotate-180' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showTranscript && (
            <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h2 className="text-xl font-bold mb-4">Full Transcript</h2>
              <div className={`whitespace-pre-wrap text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {note.transcription}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={handleBack} 
          className={`inline-flex items-center gap-2 mb-6 transition-colors ${
            theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Home
        </button>

        {/* Main Content */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 mb-6">
            <p>{error}</p>
          </div>
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};

export default NoteDetailPage; 