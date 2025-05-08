import React, { useEffect, useRef, useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const NotesDisplay = ({ notes, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const notesRef = useRef(null);

  useEffect(() => {
    if (!isLoading && notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading, notes]);

  const handleCopy = () => {
    navigator.clipboard.writeText(notes.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <LoadingSpinner text="Generating notes..." />;
  }

  return (
    <div 
      ref={notesRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 animate-fadeIn"
    >
      <div className="relative h-48 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center overflow-hidden">
        {notes.thumbnailUrl ? (
          <img 
            src={notes.thumbnailUrl} 
            alt={notes.videoTitle} 
            className="w-full h-full object-cover object-center opacity-80"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-90"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <h3 className="text-white text-xl md:text-2xl font-bold p-6 text-center drop-shadow-md">
            {notes.videoTitle}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h4>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors"
            aria-label="Copy notes to clipboard"
          >
            {copied ? (
              <>
                <CheckCircle2 size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        
        <div className="prose dark:prose-invert prose-purple prose-sm sm:prose-base max-w-none">
          {notes.content.split('\n').map((paragraph, idx) => (
            <p key={idx} className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300">{paragraph}</p>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <a 
              href={notes.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              View original video →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotesDisplay; 