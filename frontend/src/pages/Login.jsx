import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { storeTokens } from '../utils/tokenStorage';
import GoogleSignIn from '../components/GoogleSignIn';
import AuthLayout from '../components/AuthLayout';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login(formData);
      console.log("Login response data:", response);
      if (response.access) {
        // Store tokens in localStorage and cookies
        const success = storeTokens(response.access, response.refresh);
        console.log("Token storage success:", success);
        
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <AuthLayout>
      <div className={`${theme === 'dark' ? 'bg-[#1e2130]' : 'bg-white'} rounded-xl shadow-xl overflow-hidden`}>
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <h1 className="text-2xl font-bold text-white text-center">Welcome Back</h1>
          <p className="text-purple-100 text-center mt-2">Sign in to your account</p>
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
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 rounded-lg border ${
                    theme === 'dark' 
                      ? 'border-gray-700 bg-[#252a3d] text-white' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className={`block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border ${
                    theme === 'dark' 
                      ? 'border-gray-700 bg-[#252a3d] text-white' 
                      : 'border-gray-300 bg-gray-50 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  placeholder="Enter your password"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M17.3 3.3L6.7 20.7"></path>
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-6 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}></div>
            </div>
            <div className={`relative px-4 ${theme === 'dark' ? 'bg-[#1e2130]' : 'bg-white'}`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Or continue with</p>
            </div>
          </div>
          
          <div className="mt-6">
            <GoogleSignIn />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;