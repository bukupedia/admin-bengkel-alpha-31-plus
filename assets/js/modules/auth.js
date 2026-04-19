// assets/js/modules/auth.js

import { getAdminCredentials } from "../storage.js";

const SESSION_KEY = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SESSION_FINGERPRINT = "session_fp";

// Rate limiting tracking (in-memory, reset on page refresh)
let loginAttempts = 0;
let lastLoginAttempt = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

// Generate session fingerprint for additional security
function generateFingerprint() {
  const ua = navigator.userAgent || "unknown";
  const lang = navigator.language || "unknown";
  const screen = `${window.screen.width}x${window.screen.height}`;
  return btoa(`${ua}|${lang}|${screen}`).substring(0, 32);
}

// Check if user is logged in
export function isAuthenticated() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return false;
  
  try {
    const sessionData = JSON.parse(session);
    
    // Check session fingerprint
    const storedFp = localStorage.getItem(SESSION_FINGERPRINT);
    const currentFp = generateFingerprint();
    if (storedFp !== currentFp) {
      // Session fingerprint mismatch - possible session theft
      logout();
      return false;
    }
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      logout();
      return false;
    }
    
    // Extend session on activity (sliding expiration)
    sessionData.expiresAt = Date.now() + SESSION_DURATION;
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return true;
  } catch (e) {
    return false;
  }
}

// Get current user
export function getCurrentUser() {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  
  try {
    const sessionData = JSON.parse(session);
    // Return username for display
    return sessionData.username || null;
  } catch (e) {
    return null;
  }
}

// Check rate limiting
function isRateLimited() {
  const now = Date.now();
  
  // Reset attempts after lockout duration
  if (now - lastLoginAttempt > LOCKOUT_DURATION) {
    loginAttempts = 0;
  }
  
  if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    return true;
  }
  return false;
}

// Login function - validates against stored credentials
export function login(username, password) {
  // Check rate limiting
  if (isRateLimited()) {
    const timeSinceLastAttempt = Date.now() - lastLoginAttempt;
    const remaining = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 1000);
    return { 
      success: false, 
      message: `Terlalu banyak percobaan login. Coba lagi dalam ${remaining} detik.` 
    };
  }
  
  // Get credentials from storage (or use default)
  const credentials = getAdminCredentials();
  
  // Validate against stored credentials
  if (username === credentials.username && password === credentials.password) {
    // Reset login attempts on successful login
    loginAttempts = 0;
    
    const session = {
      username: username,
      loginAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    // Store session fingerprint
    localStorage.setItem(SESSION_FINGERPRINT, generateFingerprint());
    
    return { success: true };
  }
  
  // Track failed login attempts
  loginAttempts++;
  lastLoginAttempt = Date.now();
  
  return { success: false, message: "Username atau password salah" };
}

// Logout function
export function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_FINGERPRINT);
  window.location.href = "index.html";
}

// Protect page - redirect to login if not authenticated
export function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Check authentication and redirect
export function requireAuth() {
  if (!protectPage()) {
    return false;
  }
  return true;
}
