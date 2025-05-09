import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getAccessToken, getRefreshToken, storeTokens } from "../utils/tokenStorage";
import { useState, useEffect } from "react";
import axios from "axios";

// Get the base URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isChecking, setIsChecking] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    useEffect(() => {
        auth().catch((error) => {
            console.error("Auth check failed:", error);
            setErrorMessage(error.message);
            setIsAuthorized(false);
        }).finally(() => {
            setIsChecking(false);
        });
    }, []);

    const refreshToken = async () => {
        console.log("------ Token Refresh Attempt ------");
        // Get refresh token using tokenStorage utility
        const refreshToken = getRefreshToken();
        console.log("Refresh token from storage:", refreshToken ? "Token found" : "No token");
        
        if (!refreshToken) {
            console.log("No refresh token found in storage");
            setIsAuthorized(false);
            throw new Error("No refresh token available");
        }
        
        try {
            console.log("Attempting to refresh token with refresh token");
            
            // Try with fetch to diagnose issues
            try {
                console.log("Trying token refresh with fetch API...");
                const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({ refresh: refreshToken })
                });
                
                console.log("Refresh response status:", refreshResponse.status);
                
                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    console.log("Token refresh success with fetch!");
                    storeTokens(data.access, refreshToken);
                    setIsAuthorized(true);
                    return;
                } else {
                    console.log("Fetch refresh attempt failed, trying axios...");
                }
            } catch (fetchError) {
                console.error("Fetch refresh error:", fetchError);
            }
            
            // Fall back to axios if fetch fails
            const res = await axios.post(`${API_URL}/api/token/refresh/`, {
                refresh: refreshToken,
            }, {
                withCredentials: true,
            });
            
            console.log("Token refresh success! New access token received");
            if (res.status === 200) {
                // Store the new access token
                storeTokens(res.data.access, refreshToken);
                console.log("New access token stored successfully");
                setIsAuthorized(true);
            } else {
                console.log("Token refresh failed with status:", res.status);
                setIsAuthorized(false);
                throw new Error(`Refresh failed with status ${res.status}`);
            }
        } catch (error) {
            console.log("Token refresh error:", error.response?.data || error.message);
            setIsAuthorized(false);
            throw error;
        }
    };

    const auth = async () => {
        console.log("------ Auth Verification ------");
        const token = getAccessToken();
        if (!token) {
            console.log("No access token found, redirecting to login");
            setIsAuthorized(false);
            throw new Error("No access token available");
        }
        
        try {
            console.log("Attempting to decode token...");
            let decoded;
            try {
                decoded = jwtDecode(token);
                console.log("Token decoded successfully");
            } catch (decodeError) {
                console.error("Token decode error:", decodeError);
                throw new Error("Invalid token format");
            }
            
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            const timeRemaining = Math.round(tokenExpiration - now);

            console.log(`Access token expires in ${timeRemaining} seconds`);
            console.log("Token payload:", decoded);

            if (tokenExpiration < now) {
                console.log("Access token expired, attempting refresh");
                await refreshToken();
            } else {
                console.log("Access token valid, user authorized");
                
                // Verify token with backend
                try {
                    console.log("Verifying token with backend...");
                    const response = await fetch(`${API_URL}/api/auth-test/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    console.log("Auth verification status:", response.status);
                    
                    if (response.ok) {
                        console.log("Token successfully verified with backend");
                        setIsAuthorized(true);
                    } else {
                        console.error("Token verification failed with status:", response.status);
                        // Try token refresh even though not expired
                        await refreshToken();
                    }
                } catch (verifyError) {
                    console.error("Token verification error:", verifyError);
                    setIsAuthorized(true); // Optimistically set to true if server unavailable
                }
            }
        } catch (error) {
            console.log("Error validating token:", error);
            setIsAuthorized(false);
            throw error;
        }
    };

    if (isChecking) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                <div className="ml-4 text-xl text-gray-600">Verifying authentication...</div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="text-red-500 mb-4">Authentication error: {errorMessage}</div>
                <button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;