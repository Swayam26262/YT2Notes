import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeTokens } from '../utils/tokenStorage';
import { useTheme } from '../context/ThemeContext';

const GoogleSignIn = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Load the Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleSignIn = () => {
    setError('');
    setIsLoading(true);
    
    // Check if Google client is loaded
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      console.error('Google client library not loaded');
      setError('Google Sign-In is not available. Please try again later.');
      setIsLoading(false);
      return;
    }
    
    try {
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'email profile',
        ux_mode: 'popup',
        callback: async (response) => {
          if (response.code) {
            try {
              // Use the getApiBaseUrl function from api.js to ensure consistent URL handling
              const apiBaseUrl = await import('../api').then(module => module.getApiBaseUrl());
              console.log("Using API base URL for Google sign-in:", apiBaseUrl);
              console.log("Authorization code received (first 10 chars):", response.code.substring(0, 10) + '...');
              
              // First check if the endpoint exists
              try {
                await fetch(`${apiBaseUrl}/api/auth/google/`, { method: 'HEAD' });
                console.log("Google auth endpoint exists");
              } catch (headError) {
                console.error("Google auth endpoint check failed:", headError);
              }
              
              const res = await fetch(`${apiBaseUrl}/api/auth/google/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ code: response.code }),
                credentials: 'include'
              });
      
              console.log("Google auth response status:", res.status);
              console.log("Google auth response headers:", [...res.headers.entries()]);
              
              let data;
              const contentType = res.headers.get('content-type');
              
              if (contentType && contentType.includes('application/json')) {
                data = await res.json();
                console.log("Google auth response data:", data);
              } else {
                const textResponse = await res.text();
                console.error("Non-JSON response:", textResponse.substring(0, 100) + '...');
                throw new Error('Server returned non-JSON response');
              }
              
              if (!res.ok) {
                throw new Error(data.error || data.details || 'Failed to authenticate with Google');
              }

              if (data.access) {
                // Store tokens in localStorage and cookies
                const success = storeTokens(data.access, data.refresh);
                console.log("Google login token storage success:", success);
                
                navigate('/');
              } else {
                console.error("No access token in response:", data);
                throw new Error('No access token received');
              }
            } catch (error) {
              console.error('Error during Google sign in:', error);
              setError(error.message || 'Failed to sign in with Google');
              setIsLoading(false);
            }
          } else {
            console.error('No authorization code received from Google');
            setError('No authorization code received from Google');
            setIsLoading(false);
          }
        },
        error_callback: (error) => {
          console.error('Google Sign-In error:', error);
          setError('Google Sign-In failed: ' + (error.message || 'Unknown error'));
          setIsLoading(false);
        }
      });
      
      client.requestCode();
    } catch (initError) {
      console.error('Error initializing Google Sign-In:', initError);
      setError('Failed to initialize Google Sign-In');
      setIsLoading(false);
    }
  };

  return (
    <button 
      className={`flex items-center justify-center w-full py-2.5 px-4 border rounded-lg font-medium ${
        theme === 'dark' 
          ? 'border-gray-700 bg-[#252a3d] hover:bg-[#2d3349] text-white' 
          : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-800'
      } transition-colors`}
      type="button" 
      onClick={handleGoogleSignIn} 
      disabled={isLoading}
    >
      {isLoading ? 'Loading...' : (
        <>
          <svg version="1.1" width="20" height="20" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve">
            <path style={{ fill: '#FBBB00' }} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"></path>
            <path style={{ fill: '#518EF8' }} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451 c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535 c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"></path>
            <path style={{ fill: '#28B446' }} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512 c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771 c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"></path>
            <path style={{ fill: '#F14336' }} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012 c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0 C318.115,0,375.068,22.126,419.404,58.936z"></path>
          </svg>
          <span className="ml-2">Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignIn; 