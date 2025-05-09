import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { getAccessToken, getRefreshToken, storeTokens } from "../utils/tokenStorage";
import { useState, useEffect } from "react";


function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        auth().catch(() => setIsAuthorized(false))
    }, [])

    const refreshToken = async () => {
        console.log("------ Token Refresh Attempt ------");
        // Get refresh token using tokenStorage utility
        const refreshToken = getRefreshToken();
        console.log("Refresh token from storage:", refreshToken ? "Token found" : "No token");
        
        if (!refreshToken) {
            console.log("No refresh token found in storage");
            setIsAuthorized(false);
            return;
        }
        
        try {
            console.log("Attempting to refresh token with refresh token");
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            console.log("Token refresh success! New access token received");
            if (res.status === 200) {
                // Store the new access token
                storeTokens(res.data.access, refreshToken);
                console.log("New access token stored successfully");
                setIsAuthorized(true)
            } else {
                console.log("Token refresh failed with status:", res.status);
                setIsAuthorized(false)
            }
        } catch (error) {
            console.log("Token refresh error:", error.response?.data || error.message);
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        console.log("------ Auth Verification ------");
        const token = getAccessToken();
        if (!token) {
            console.log("No access token found, redirecting to login");
            setIsAuthorized(false);
            return;
        }
        
        try {
            const decoded = jwtDecode(token);
            const tokenExpiration = decoded.exp;
            const now = Date.now() / 1000;
            const timeRemaining = Math.round(tokenExpiration - now);

            console.log(`Access token expires in ${timeRemaining} seconds`);

            if (tokenExpiration < now) {
                console.log("Access token expired, attempting refresh");
                await refreshToken();
            } else {
                console.log("Access token valid, user authorized");
                setIsAuthorized(true);
            }
        } catch (error) {
            console.log("Error validating token:", error);
            setIsAuthorized(false);
        }
    };

    if (isAuthorized === null) {
        return <div>Loading...</div>;
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;