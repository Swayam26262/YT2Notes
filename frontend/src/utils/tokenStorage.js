import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

// Helper to set cookies with expiration
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Strict";
}

// Helper to get cookies
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Helper to erase cookies
function eraseCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Store tokens with localStorage and cookie fallback
export function storeTokens(accessToken, refreshToken) {
  try {
    // Try localStorage
    localStorage.setItem(ACCESS_TOKEN, accessToken);
    localStorage.setItem(REFRESH_TOKEN, refreshToken);
    
    // Also set cookies as fallback
    setCookie(ACCESS_TOKEN, accessToken, 1); // 1 day for access token
    setCookie(REFRESH_TOKEN, refreshToken, 7); // 7 days for refresh token
    
    return true;
  } catch (e) {
    console.error("Error storing tokens:", e);
    
    // Try cookies only if localStorage fails
    try {
      setCookie(ACCESS_TOKEN, accessToken, 1);
      setCookie(REFRESH_TOKEN, refreshToken, 7);
      return true;
    } catch (e) {
      console.error("Error storing tokens in cookies:", e);
      return false;
    }
  }
}

// Get access token using localStorage with cookie fallback
export function getAccessToken() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    return token || getCookie(ACCESS_TOKEN);
  } catch (e) {
    console.error("Error getting access token:", e);
    return getCookie(ACCESS_TOKEN);
  }
}

// Get refresh token using localStorage with cookie fallback
export function getRefreshToken() {
  try {
    const token = localStorage.getItem(REFRESH_TOKEN);
    return token || getCookie(REFRESH_TOKEN);
  } catch (e) {
    console.error("Error getting refresh token:", e);
    return getCookie(REFRESH_TOKEN);
  }
}

// Clear tokens from both localStorage and cookies
export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
  } catch (e) {
    console.error("Error clearing tokens from localStorage:", e);
  }
  
  // Always clear cookies too
  eraseCookie(ACCESS_TOKEN);
  eraseCookie(REFRESH_TOKEN);
} 