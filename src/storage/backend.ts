/**
 * src/storage/backend.ts
 * LabWatch — Backend URL storage helper
 *
 * Single source of truth for reading and writing the active backend URL.
 * All other code calls these functions — nothing reads AsyncStorage directly.
 *
 * Default falls back to the Auxcon demo backend so new users see a working
 * dashboard immediately with zero setup.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL_KEY = 'labwatch:backend_url';
const DEFAULT_BACKEND_URL = 'https://api.auxcon.dev';

/**
 * Get the currently saved backend URL.
 * Returns the default if nothing has been saved yet.
 */
export async function getBackendUrl(): Promise<string> {
  try {
    const saved = await AsyncStorage.getItem(BACKEND_URL_KEY);
    return saved ?? DEFAULT_BACKEND_URL;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

/**
 * Save a new backend URL.
 * Strips trailing slashes so URLs are always in a consistent format.
 */
export async function setBackendUrl(url: string): Promise<void> {
  const clean = url.trim().replace(/\/+$/, '');
  await AsyncStorage.setItem(BACKEND_URL_KEY, clean);
}

/**
 * Reset the backend URL back to the default.
 */
export async function resetBackendUrl(): Promise<void> {
  await AsyncStorage.removeItem(BACKEND_URL_KEY);
}

export { DEFAULT_BACKEND_URL };