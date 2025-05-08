import React, { useEffect, useState } from 'react';
import { getUserNotes, deleteNote } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';

const NotesListPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await getUserNotes();
      setNotes(data);
      setError('');
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load your notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        setNotes(notes.filter(note => note.id !== id));
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again.');
      }
    }
  };

  const handleGenerateNewNotes = () => {
    navigate('/');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mr-3"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Loading your notes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400 my-4">
          <p>{error}</p>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <svg className="h-16 w-16 mx-auto text-purple-600 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3 className="text-xl sm:text-2xl font-bold mb-4">You don't have any notes yet</h3>
          <p className={`text-base sm:text-lg mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Create your first notes by converting a YouTube video
          </p>
          <button 
            onClick={handleGenerateNewNotes} 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Generate Your First Notes
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div 
            key={note.id} 
            className={`rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">{note.youtube_title}</h3>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Created: {new Date(note.created_at).toLocaleDateString()}
              </p>
              <div className="flex justify-between">
                <Link 
                  to={`/notes/${note.id}`} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  View Notes
                </Link>
                <button 
                  onClick={() => handleDeleteNote(note.id)} 
                  className={`px-4 py-2 rounded-lg text-sm ${
                    theme === 'dark' 
                    ? 'bg-gray-700 text-red-400 hover:bg-red-900/30' 
                    : 'bg-gray-100 text-red-600 hover:bg-red-50'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <button 
              onClick={handleBackToHome} 
              className={`mr-4 p-2 rounded-full ${
                theme === 'dark' 
                ? 'hover:bg-gray-800 text-gray-300' 
                : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold">Your Notes</h1>
          </div>
          <button 
            onClick={handleGenerateNewNotes} 
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Generate New Notes
          </button>
        </div>

        {/* Notes Content */}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default NotesListPage; 