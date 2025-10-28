// Session management for passcode gate
// Provides 24-hour session persistence to avoid re-entering passcode

import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'app_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface SessionData {
  timestamp: number;
  expiresAt: number;
}

/**
 * Creates a new session after successful passcode verification
 * Session expires after 24 hours
 */
export async function createSession(): Promise<void> {
  try {
    const sessionData: SessionData = {
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to create session:', error);
  }
}

/**
 * Checks if the current session is valid (not expired)
 * @returns true if session exists and hasn't expired, false otherwise
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return false;
    }

    const parsed: SessionData = JSON.parse(sessionData);
    const now = Date.now();

    // Check if session has expired
    if (now >= parsed.expiresAt) {
      // Session expired, clean it up
      await clearSession();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to check session validity:', error);
    // If there's an error parsing, clear the session
    await clearSession();
    return false;
  }
}

/**
 * Clears the current session (forces passcode re-entry)
 * Useful for logout functionality
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Gets session info for debugging/logging purposes
 * @returns session data or null if no session exists
 */
export async function getSessionInfo(): Promise<SessionData | null> {
  try {
    const sessionData = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    return JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to get session info:', error);
    return null;
  }
}
