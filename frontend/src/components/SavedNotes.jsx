import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, ExternalLink } from 'lucide-react';

const SavedNotes = ({ notes, onDelete, onView, activeNotesId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (notes.length === 0) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer border-b border-gray-200 dark:border-gray-700"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          Saved Notes
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
            {notes.length}
          </span>
        </h3>
        <button 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
          aria-label={isCollapsed ? "Expand saved notes" : "Collapse saved notes"}
        >
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>
      </div>
      
      {!isCollapsed && (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {notes.map((note) => (
            <li 
              key={note.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                note.id === activeNotesId ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
            >
              <div className="flex items-start justify-between p-4 gap-4">
                <button 
                  className="flex-1 flex items-start gap-3 text-left"
                  onClick={() => onView(note)}
                >
                  {note.thumbnailUrl && (
                    <div className="flex-shrink-0 h-12 w-20 rounded overflow-hidden">
                      <img 
                        src={note.thumbnailUrl} 
                        alt="" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {note.videoTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Notes created on {formatDate(note.createdAt)}
                    </p>
                  </div>
                </button>
                
                <div className="flex items-center gap-2">
                  <a
                    href={note.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="View original video"
                  >
                    <ExternalLink size={18} />
                  </a>
                  
                  <button
                    onClick={() => onDelete(note.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label="Delete notes"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedNotes; 