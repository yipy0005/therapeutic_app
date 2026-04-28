import type { StoredData, BadgeType, SessionState, EmotionHistoryRecord, ProfileRegistry, Profile } from '../types';

const STORAGE_PREFIX = 'feelings-explorer';
const REGISTRY_KEY = 'feelings-explorer-profiles';

// Active profile id — set by ProfileContext
let activeProfileId: string | null = null;

function getStorageKey(): string {
  if (!activeProfileId) return STORAGE_PREFIX;
  return `${STORAGE_PREFIX}-${activeProfileId}`;
}

const INITIAL_SESSION: SessionState = {
  weatherMetaphor: null,
  bodyRegions: [],
  intensityLevel: null,
  selectedEmotions: [],
  emotionValence: null,
  calmToolsUsed: [],
  reflectionResponses: {},
  nextStep: null,
  currentStep: 'home',
};

export const INITIAL_DATA: StoredData = {
  version: 1,
  currentSession: null,
  badgeCollection: [] as BadgeType[],
  emotionHistory: [],
};

// In-memory fallback used when localStorage is unavailable
let inMemoryData: StoredData = { ...INITIAL_DATA };
let useInMemory = false;

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__feelings_explorer_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Profile registry (stored separately)
// ---------------------------------------------------------------------------
const INITIAL_REGISTRY: ProfileRegistry = { profiles: [], activeProfileId: null };

export function loadRegistry(): ProfileRegistry {
  if (useInMemory) return { ...INITIAL_REGISTRY };
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return { ...INITIAL_REGISTRY };
    return JSON.parse(raw) as ProfileRegistry;
  } catch {
    return { ...INITIAL_REGISTRY };
  }
}

export function saveRegistry(registry: ProfileRegistry): void {
  if (useInMemory) return;
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  } catch {
    // silent fail
  }
}

export function setActiveProfile(profileId: string | null): void {
  activeProfileId = profileId;
  // Also persist to registry
  const reg = loadRegistry();
  reg.activeProfileId = profileId;
  saveRegistry(reg);
}

export function getActiveProfileId(): string | null {
  return activeProfileId;
}

// ---------------------------------------------------------------------------
// Per-profile data
// ---------------------------------------------------------------------------
export function loadData(): StoredData {
  if (useInMemory) return inMemoryData;

  let raw: string | null;
  try {
    raw = localStorage.getItem(getStorageKey());
  } catch (err) {
    console.warn('[feelings-explorer] localStorage unavailable, falling back to in-memory.', err);
    useInMemory = true;
    return inMemoryData;
  }

  if (raw === null) return { ...INITIAL_DATA };

  try {
    const parsed = JSON.parse(raw) as StoredData;
    if (parsed.version !== 1) return { ...INITIAL_DATA };
    return parsed;
  } catch {
    return { ...INITIAL_DATA };
  }
}

export function saveData(data: StoredData): void {
  if (useInMemory) {
    inMemoryData = data;
    return;
  }
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
  } catch (err) {
    console.warn('[feelings-explorer] localStorage write failed, falling back to in-memory.', err);
    useInMemory = true;
    inMemoryData = data;
  }
}

export function clearData(): void {
  if (useInMemory) {
    inMemoryData = { ...INITIAL_DATA };
    return;
  }
  try {
    localStorage.removeItem(getStorageKey());
  } catch (err) {
    console.warn('[feelings-explorer] localStorage clear failed, resetting in-memory.', err);
    useInMemory = true;
    inMemoryData = { ...INITIAL_DATA };
  }
}

/** Load data for a specific profile (used by parent dashboard) */
export function loadDataForProfile(profileId: string): StoredData {
  if (useInMemory) return { ...INITIAL_DATA };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}-${profileId}`);
    if (!raw) return { ...INITIAL_DATA };
    const parsed = JSON.parse(raw) as StoredData;
    if (parsed.version !== 1) return { ...INITIAL_DATA };
    return parsed;
  } catch {
    return { ...INITIAL_DATA };
  }
}

/** Clear data for a specific profile */
export function clearDataForProfile(profileId: string): void {
  if (useInMemory) return;
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}-${profileId}`);
  } catch {
    // silent fail
  }
}

/** Delete a profile entirely (registry + data) */
export function deleteProfile(profileId: string): void {
  clearDataForProfile(profileId);
  const reg = loadRegistry();
  reg.profiles = reg.profiles.filter((p) => p.id !== profileId);
  if (reg.activeProfileId === profileId) reg.activeProfileId = null;
  saveRegistry(reg);
}

/** Reset the in-memory fallback flag (useful for testing) */
export function _resetFallbackState(): void {
  useInMemory = false;
  activeProfileId = null;
  inMemoryData = { ...INITIAL_DATA };
}

/** Append a completed session to emotion history (max 90 records) */
export function saveEmotionRecord(record: EmotionHistoryRecord): void {
  const data = loadData();
  const history = data.emotionHistory ?? [];
  const updated = [record, ...history].slice(0, 90);
  saveData({ ...data, emotionHistory: updated });
}
