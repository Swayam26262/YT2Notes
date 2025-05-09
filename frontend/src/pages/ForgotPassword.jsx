import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { passwordReset } from '../api';
import AuthLayout from '../components/AuthLayout';
import { useTheme } from '../context/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      await passwordReset(email);
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Check if it's a connection error
      if (err.message && (
          err.message.includes('Network Error') || 
          err.message.includes('Connection refused') ||
          err.message.includes('Failed to fetch') ||
          !err.response
      )) {
        setError('Unable to connect to the server. Please make sure the backend server is running.');
      } else {
        // Handle other errors
        const data = err.response?.data;
        if (typeof data === 'string') {
          setError(data);
        } else if (data?.detail) {
          setError(data.detail);
        } else if (data?.email) {
          setError(data.email[0]);
        } else {
          setError('Failed to send reset email.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className={`${theme === 'dark' ? 'bg-[#1e2130]' : 'bg-white'} rounded-xl shadow-xl overflow-hidden`}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">Reset Password</h1>
          <p className="text-purple-100 text-center mt-2">Enter your email to receive a reset link</p>
        </div>
        
        {/* Form Section */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-900/30 text-red-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {submitted ? (
            <div className="p-4 rounded bg-green-900/30 text-green-300 text-center">
              <svg className="w-6 h-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p>If an account exists with this email, we've sent a password reset link.</p>
              <p className="mt-4 text-sm">
                Check your inbox and spam folder. The link will expire in 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                      theme === 'dark' 
                        ? 'border-gray-700 bg-[#252a3d] text-white' 
                        : 'border-gray-300 bg-gray-50 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium ${
                  isLoading 
                    ? 'bg-purple-600/70 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                } transition-colors`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Remember your password?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword; 