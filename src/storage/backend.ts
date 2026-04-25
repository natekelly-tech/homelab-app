/**
 * src/storage/backend.ts
 * LabWatch — Backend storage helper
 *
 * Step E update: adds saved backends list and active selection.
 * getBackendUrl() is unchanged so index.tsx and welcome.tsx need no edits.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---

export type SavedBackend = {
  id: string;     // unique identifier, timestamp string at creation time
  label: string;  // user-defined friendly name e.g. "Home Lab"
  url: string;    // full backend URL
};

// --- Constants ---

export const DEFAULT_BACKEND_URL = 'https://api.auxcon.dev';

export const DEMO_BACKEND: SavedBackend = {
  id: 'demo',
  label: 'Demo (api.auxcon.dev)',
  url: DEFAULT_BACKEND_URL,
};

// AsyncStorage keys
const BACKENDS_KEY = 'labwatch:saved_backends';
const ACTIVE_BACKEND_ID_KEY = 'labwatch:active_backend_id';
const ONBOARDED_KEY = 'labwatch:has_onboarded';

// --- Saved Backends List ---

export async function getSavedBackends(): Promise<SavedBackend[]> {
  try {
    const raw = await AsyncStorage.getItem(BACKENDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedBackend[];
  } catch {
    return [];
  }
}

export async function addSavedBackend(backend: SavedBackend): Promise<void> {
  const existing = await getSavedBackends();
  // Prevent duplicates by URL -- newest entry wins
  const deduped = existing.filter(b => b.url !== backend.url);
  await AsyncStorage.setItem(BACKENDS_KEY, JSON.stringify([...deduped, backend]));
}

export async function removeSavedBackend(id: string): Promise<void> {
  const existing = await getSavedBackends();
  const updated = existing.filter(b => b.id !== id);
  await AsyncStorage.setItem(BACKENDS_KEY, JSON.stringify(updated));
  // If the deleted backend was active, fall back to demo
  const activeId = await getActiveBackendId();
  if (activeId === id) {
    await setActiveBackendId('demo');
  }
}

// --- Active Backend Selection ---

export async function getActiveBackendId(): Promise<string> {
  try {
    const id = await AsyncStorage.getItem(ACTIVE_BACKEND_ID_KEY);
    return id ?? 'demo';
  } catch {
    return 'demo';
  }
}

export async function setActiveBackendId(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_BACKEND_ID_KEY, id);
}

// --- Derived: Active Backend URL ---
// Called by index.tsx and welcome.tsx. No changes needed in those files.

export async function getBackendUrl(): Promise<string> {
  const activeId = await getActiveBackendId();
  if (activeId === 'demo') return DEFAULT_BACKEND_URL;
  const backends = await getSavedBackends();
  const match = backends.find(b => b.id === activeId);
  return match?.url ?? DEFAULT_BACKEND_URL;
}

export async function setBackendUrl(url: string): Promise<void> {
  // Kept for compatibility with settings.tsx direct URL saves.
  // Creates a backend entry and makes it active.
  const clean = url.trim().replace(/\/+$/, '');
  const id = Date.now().toString();
  const backend: SavedBackend = {
    id,
    label: new URL(clean).hostname,
    url: clean,
  };
  await addSavedBackend(backend);
  await setActiveBackendId(id);
}

export async function resetBackendUrl(): Promise<void> {
  await setActiveBackendId('demo');
}

// --- Onboarding ---

export async function getHasOnboarded(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDED_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setHasOnboarded(value: boolean = true): Promise<void> {
  await AsyncStorage.setItem(ONBOARDED_KEY, value ? 'true' : 'false');
}