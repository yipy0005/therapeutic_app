import type { StoredData, BadgeType, SessionState, EmotionHistoryRecord } from '../types';

const STORAGE_KEY = 'feelings-explorer';

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

export function loadData(): StoredData {
  if (useInMemory) {
    return inMemoryData;
  }

  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[feelings-explorer] localStorage unavailable, falling back to in-memory.', err);
    useInMemory = true;
    return inMemoryData;
  }

  if (raw === null) {
    return { ...INITIAL_DATA };
  }

  try {
    const parsed = JSON.parse(raw) as StoredData;

    // Validate schema version
    if (parsed.version !== 1) {
      console.warn('[feelings-explorer] Invalid schema version, resetting to clean state.');
      return { ...INITIAL_DATA };
    }

    return parsed;
  } catch (err) {
    // Corrupted JSON — reset to clean state but keep storage available
    console.warn('[feelings-explorer] Corrupted localStorage data, resetting to clean state.', err);
    return { ...INITIAL_DATA };
  }
}

export function saveData(data: StoredData): void {
  if (useInMemory) {
    inMemoryData = data;
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[feelings-explorer] localStorage clear failed, resetting in-memory.', err);
    useInMemory = true;
    inMemoryData = { ...INITIAL_DATA };
  }
}

/** Reset the in-memory fallback flag (useful for testing) */
export function _resetFallbackState(): void {
  useInMemory = false;
  inMemoryData = { ...INITIAL_DATA };
}

/** Append a completed session to emotion history (max 90 records) */
export function saveEmotionRecord(record: EmotionHistoryRecord): void {
  const data = loadData();
  const history = data.emotionHistory ?? [];
  const updated = [record, ...history].slice(0, 90);
  saveData({ ...data, emotionHistory: updated });
}
