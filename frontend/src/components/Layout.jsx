import React from 'react';
import Header from './Header';
import { useTheme } from '../context/ThemeContext';
import ContactForm from './ContactForm';

const Layout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-8">Transform YouTube Videos into Smart Notes</h1>
            <p className="text-xl sm:text-2xl md:text-3xl mb-6 sm:mb-10 text-purple-100">Study smarter, not harder. Convert any YouTube video into organized, comprehensive notes.</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-6xl">
        {children}
      </main>

      {/* Features Section */}
      <section className={`py-10 sm:py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-16">Why Choose YT2Notes?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
            <div className="text-center p-4 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <svg className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Save Time</h3>
              <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Extract key information without watching entire videos multiple times.
              </p>
            </div>
            <div className="text-center p-4 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <svg className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Better Learning</h3>
              <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Organized notes help you understand and retain information more effectively.
              </p>
            </div>
            <div className="text-center p-4 sm:p-8">
              <div className="flex justify-center mb-4 sm:mb-6">
                <svg className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Easy Review</h3>
              <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Quick access to your saved notes whenever you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-10 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-16">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="relative">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6 sm:p-8">
                <span className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold">1</span>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 mt-2">Paste URL</h3>
                <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Copy and paste any YouTube video URL into the input field.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6 sm:p-8">
                <span className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold">2</span>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 mt-2">Convert</h3>
                <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Click convert and let our AI transform the video into smart notes.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-6 sm:p-8">
                <span className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold">3</span>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 mt-2">Save & Study</h3>
                <p className={`text-base sm:text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Access your notes anytime and study more efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Is YT2Notes free to use?</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Yes, YT2Notes is completely free to use for all YouTube videos.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">How accurate are the notes?</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Our AI system captures key points with high accuracy, but we recommend reviewing the generated notes.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Can I edit the generated notes?</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Currently, notes are view-only, but we're working on adding editing capabilities.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Are my notes saved permanently?</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Notes are saved in your browser's local storage and persist until you delete them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Get in Touch</h2>
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <svg className="h-12 w-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-xl mb-8 text-center">Have questions or suggestions? We'd love to hear from you!</p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-6 sm:py-8 text-center text-xs sm:text-sm ${
        theme === 'dark' ? 'text-gray-400 border-t border-gray-800' : 'text-gray-600 border-t border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <p>© {new Date().getFullYear()} YT2Notes. All rights reserved.</p>
          {/* <div className="mt-3 sm:mt-4 space-x-3 sm:space-x-4">
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default Layout; 