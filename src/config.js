// Shared environment settings
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5000/api';

// Get current active user ID from local storage
export function getUserId() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('ecotrack_user_id') || null;
  }
  return null;
}

// Set current active user ID to local storage
export function setUserId(id) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('ecotrack_user_id', id);
  }
}

// Generate default headers containing user ID
export function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getUserId()
  };
}
