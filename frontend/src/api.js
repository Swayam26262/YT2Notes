import axios from "axios"
import { getAccessToken } from "./utils/tokenStorage"

const api = axios.create({
    baseURL: '' || 'http://localhost:8000'
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
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

export const login = async (credentials) => {
    try {
        console.log("Attempting login with credentials:", { ...credentials, password: "***" });
        
        // Create proper form data and explicitly set Content-Type
        const response = await publicApi.post('/api/token/', credentials, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log("Login response data:", response.data);
        
        // Test localStorage
        const testKey = "testLocalStorage";
        localStorage.setItem(testKey, "test");
        const testValue = localStorage.getItem(testKey);
        console.log("LocalStorage test:", testKey, "=", testValue);
        localStorage.removeItem(testKey);
        
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

export const register = async (userData) => {
    try {
        console.log("Attempting registration with data:", { ...userData, password: "***" });
        // Use publicApi instead of api to bypass authentication
        const response = await publicApi.post('/dj-rest-auth/registration/', userData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Registration response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Registration error:", error.response?.data || error.message);
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
        
        // Try a simpler, more direct approach first as a test
        try {
            console.log('Making direct fetch request to test endpoint connectivity...');
            const testResponse = await fetch(`${api.defaults.baseURL}/api/home/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Test endpoint response:', testResponse.status);
        } catch (testErr) {
            console.error('Test endpoint error:', testErr);
        }
        
        console.log('Sending POST request to /api/notes/generate/');
        console.log('Request payload:', { link: youtubeLink });
        
        // Make the request with explicit timeout and headers logging
        const config = {
            timeout: 300000, // 5 minute timeout
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        console.log('Request config:', config);
        
        // Try the request with fetch API as well (as a backup)
        console.log('Attempting fetch API call as backup...');
        try {
            // Using a direct baseUrl to avoid any axios config issues
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            console.log('Using base URL from environment:', baseUrl);
            
            const fetchResponse = await fetch(`${baseUrl}/api/notes/generate/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ link: youtubeLink })
            });
            
            console.log('Fetch response status:', fetchResponse.status);
            
            if (fetchResponse.ok) {
                const fetchData = await fetchResponse.json();
                console.log('Fetch API successful:', fetchData);
                return fetchData;
            } else {
                console.error('Fetch API failed with status:', fetchResponse.status);
                
                // Try to get more information about the error
                try {
                    const errorData = await fetchResponse.json();
                    console.error('Error response data:', errorData);
                    throw new Error(`API error (${fetchResponse.status}): ${JSON.stringify(errorData)}`);
                } catch (jsonErr) {
                    // If the response is not JSON, try to get text
                    const errorText = await fetchResponse.text().catch(() => 'No response text');
                    console.error('Error response text:', errorText);
                    throw new Error(`API error (${fetchResponse.status}): ${errorText}`);
                }
            }
        } catch (fetchErr) {
            console.error('Fetch API error:', fetchErr);
            throw fetchErr; // Re-throw to prevent falling back to axios if fetch had a real error
        }
        
        // This code should only run if the fetch approach somehow didn't throw but also didn't return
        console.log('Continuing with axios approach as fallback...');
        const response = await api.post('/api/notes/generate/', { link: youtubeLink }, config);
        
        console.log('Response received:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('API error in generateNotes:', error);
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        
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