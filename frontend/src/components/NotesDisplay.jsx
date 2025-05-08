import React from 'react';
import { Link } from 'react-router-dom';
import { convertMarkdownToHtml } from '../utils/markdownConverter';

const NotesDisplay = ({ notes }) => {
  if (!notes) {
    return null;
  }

  return (
    <div className="notes-display bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="notes-header mb-6">
        <h2 className="text-2xl font-bold mb-3">{notes.youtube_title}</h2>
        <div className="notes-meta flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <a 
            href={notes.youtube_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:underline"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
              <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
            View Original Video
          </a>
          <span>
            Created: {new Date(notes.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="notes-content mb-6">
        <div dangerouslySetInnerHTML={{ 
          __html: convertMarkdownToHtml(notes.notes_content)
        }} />
      </div>
      
      <div className="notes-actions flex gap-3 mt-8">
        <Link 
          to={`/notes/${notes.id}`} 
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          View Full Notes
        </Link>
        <button 
          onClick={() => window.print()} 
          className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Print Notes
        </button>
      </div>
    </div>
  );
};

export default NotesDisplay; 