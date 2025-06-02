import axios from "axios"
import { getAccessToken } from "./utils/tokenStorage"

// Determine the API base URL based on environment
export const getApiBaseUrl = () => {
    // If VITE_API_URL is set, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // For local development, use localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }
    
    // Default to production URL
    return 'https://yt2notes-backend.onrender.com';
};

const api = axios.create({
    baseURL: getApiBaseUrl()
})

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Create a separate instance without auth interceptors for public endpoints
const publicApi = axios.create({
    baseURL: getApiBaseUrl()
})

export const login = async (credentials) => {
    try {
        // Try dj-rest-auth login endpoint first
        console.log("Attempting login with credentials:", { ...credentials, password: "***" });
        console.log("Using baseURL:", publicApi.defaults.baseURL);
        console.log("Sending login request to:", `${publicApi.defaults.baseURL}/dj-rest-auth/login/`);
        
        // Check if the endpoint exists first with a HEAD request
        try {
            await publicApi.head('/dj-rest-auth/login/');
            console.log("dj-rest-auth/login/ endpoint exists");
        } catch (headError) {
            console.warn("dj-rest-auth/login/ endpoint check failed:", headError.message);
            console.log("Status code:", headError.response?.status);
        }
        
        const response = await publicApi.post('/dj-rest-auth/login/', credentials, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log("dj-rest-auth login successful, response:", response.data);
        
        // If we get a key but no access token, try to get JWT token
        if (response.data.key && !response.data.access) {
            console.log("Got dj-rest-auth key, fetching JWT token");
            const tokenResponse = await publicApi.post('/api/token/', credentials);
            return tokenResponse.data;
        }
        
        return response.data;
    } catch (error) {
        // Log detailed information about the error
        console.error("dj-rest-auth login failed:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        // If dj-rest-auth login fails, try JWT token endpoint
        console.log("Trying JWT token endpoint as fallback");
        
        try {
            // Check if the endpoint exists first
            try {
                await publicApi.head('/api/token/');
                console.log("/api/token/ endpoint exists");
            } catch (headError) {
                console.warn("/api/token/ endpoint check failed:", headError.message);
                console.log("Status code:", headError.response?.status);
            }
            
            const tokenResponse = await publicApi.post('/api/token/', credentials, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            console.log("JWT token login successful");
            return tokenResponse.data;
        } catch (tokenError) {
            console.error("All login attempts failed. Details:", {
                message: tokenError.message,
                status: tokenError.response?.status,
                statusText: tokenError.response?.statusText,
                data: tokenError.response?.data,
                headers: tokenError.response?.headers
            });
            
            // Try to parse the error response if it's HTML
            if (typeof tokenError.response?.data === 'string' && 
                tokenError.response.data.includes('<!doctype html>')) {
                console.error("Received HTML error response instead of JSON. This suggests a server configuration issue.");
            }
            
            throw tokenError;
        }
    }
};

export const register = async (userData) => {
    try {
        // Format data according to dj-rest-auth requirements
        // dj-rest-auth expects password1 and password2 fields
        const formattedData = {
            username: userData.username,
            email: userData.email,
            password1: userData.password,  // dj-rest-auth expects password1
            password2: userData.password   // dj-rest-auth expects password2 for confirmation
        };
        
        console.log("Attempting registration with data:", { 
            ...formattedData, 
            password1: "***", 
            password2: "***" 
        });
        console.log("Using registration endpoint:", `${publicApi.defaults.baseURL}/dj-rest-auth/registration/`);
        
        // Use publicApi instead of api to bypass authentication
        const response = await publicApi.post('/dj-rest-auth/registration/', formattedData, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        // Log the full response for debugging
        console.log("Registration response status:", response.status);
        console.log("Registration response headers:", response.headers);
        console.log("Registration response data:", response.data);
        
        // Return the data even if it's an empty object
        // The Register component will handle different response formats
        return response.data || { success: true };
    } catch (error) {
        console.error("Registration error details:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        // If we get a 400 error but the user might have been created anyway
        // (this happens sometimes with dj-rest-auth)
        if (error.response?.status === 400 && 
            (error.response?.data?.username?.[0]?.includes('already exists') ||
             error.response?.data?.email?.[0]?.includes('already exists'))) {
            console.log("User might already exist, treating as partial success");
            return { success: true, detail: "User might already exist" };
        }
        
        throw error;
    }
};

export const passwordReset = async (email) => {
    try {
        console.log('Attempting password reset for email:', email);
        const response = await publicApi.post('/api/password-reset/', { email });
        console.log('Password reset response:', response.status);
        return response.data;
    } catch (error) {
        console.error('Password reset error:', error.message);
        if (error.message.includes('Network Error') || !error.response) {
            console.error('Connection error detected. Server might be down.');
        }
        throw error;
    }
};

export const resetPasswordConfirm = async (uid, token, new_password) => {
    try {
        console.log('Attempting to confirm password reset');
        const response = await publicApi.post('/api/password-reset-confirm/', {
            uid: uid,
            token: token,
            new_password: new_password
        });
        console.log('Password reset confirm response:', response.status);
        return response.data;
    } catch (error) {
        console.error('Password reset confirm error:', error.message);
        if (error.message.includes('Network Error') || !error.response) {
            console.error('Connection error detected. Server might be down.');
        }
        throw error;
    }
};

export const generateNotes = async (youtubeLink) => {
    console.log('generateNotes called with:', youtubeLink);
    
    try {
        // Check if we're authenticated before making the request
        const token = getAccessToken();
        if (!token) {
            console.error('No authentication token found');
            throw new Error('You must be logged in to generate notes');
        }
        
        console.log('Authentication token is present');
        console.log('API base URL:', api.defaults.baseURL);
        
        // Using our getApiBaseUrl function to ensure consistent URL across the app
        const baseUrl = getApiBaseUrl();
        console.log('Using base URL:', baseUrl);
        
        // Create AbortController for timeout - increased to 10 minutes
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
        
        try {
            const response = await fetch(`${baseUrl}/api/notes/generate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ link: youtubeLink }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId); // Clear timeout if request completes
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                return data;
            } else {
                // Try to get error details
                try {
                    const errorData = await response.json();
                    console.error('Error response data:', errorData);
                    throw new Error(errorData.error || errorData.detail || `Server error (${response.status})`);
                } catch (jsonErr) {
                    const errorText = await response.text().catch(() => 'No response text');
                    console.error('Error response text:', errorText);
                    throw new Error(`Server error (${response.status}): ${errorText}`);
                }
            }
        } catch (fetchErr) {
            if (fetchErr.name === 'AbortError') {
                throw new Error('Request timed out after 10 minutes. This could be because:\n1. The video is too long (try a shorter video)\n2. The server is busy (try again in a few minutes)\n3. There might be network issues (check your connection)');
            }
            throw fetchErr;
        }
    } catch (error) {
        console.error('Error in generateNotes:', error);
        throw error;
    }
};

export const getUserNotes = async () => {
    const response = await api.get('/api/notes/');
    return response.data;
};

export const getNoteDetails = async (noteId) => {
    const response = await api.get(`/api/notes/${noteId}/`);
    return response.data;
};

export const updateNote = async (noteId, data) => {
    const response = await api.patch(`/api/notes/${noteId}/`, data);
    return response.data;
};

export const deleteNote = async (noteId) => {
    const response = await api.delete(`/api/notes/${noteId}/`);
    return response.data;
};

export default api