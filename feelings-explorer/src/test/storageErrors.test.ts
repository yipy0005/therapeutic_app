// Feature: feelings-explorer — storage error handling unit tests
// Requirements: 13.1, 13.6

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadData, saveData, isStorageAvailable, _resetFallbackState, INITIAL_DATA } from '../storage/adapter';

// Helper: create a working in-memory localStorage mock
function makeWorkingStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
}

describe('Storage error handling', () => {
  beforeEach(() => {
    _resetFallbackState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    _resetFallbackState();
  });

  // ---------------------------------------------------------------------------
  // Test 1: Corrupted JSON → clean state, no crash
  // ---------------------------------------------------------------------------
  describe('Test 1: Corrupted JSON returns clean initial state', () => {
    it('returns clean initial state when localStorage contains invalid JSON', () => {
      const storage = makeWorkingStorage();
      storage.setItem('feelings-explorer', 'not valid json{{{');
      vi.stubGlobal('localStorage', storage);

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      let result: ReturnType<typeof loadData> | undefined;
      expect(() => {
        result = loadData();
      }).not.toThrow();

      expect(result).toEqual(INITIAL_DATA);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('does not set in-memory fallback after a JSON parse error (storage is still usable)', () => {
      const storage = makeWorkingStorage();
      storage.setItem('feelings-explorer', 'not valid json{{{');
      vi.stubGlobal('localStorage', storage);
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      // First call: corrupted data → clean state
      const first = loadData();
      expect(first).toEqual(INITIAL_DATA);

      // Now update storage with valid data — should still read from localStorage (not in-memory)
      const validData = { ...INITIAL_DATA, badgeCollection: ['feeling-detective' as const] };
      storage.setItem('feelings-explorer', JSON.stringify(validData));

      const second = loadData();
      expect(second).toEqual(validData);
    });
  });

  // ---------------------------------------------------------------------------
  // Test 2: Storage unavailable → in-memory session completes without error
  // ---------------------------------------------------------------------------
  describe('Test 2: Storage unavailable falls back to in-memory', () => {
    it('saveData does not throw when localStorage.setItem throws', () => {
      const storage = makeWorkingStorage();
      vi.stubGlobal('localStorage', storage);
      vi.spyOn(storage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = { ...INITIAL_DATA, badgeCollection: ['brave-breather' as const] };

      expect(() => {
        saveData(data);
      }).not.toThrow();
    });

    it('subsequent loadData returns the in-memory fallback data after setItem throws', () => {
      const storage = makeWorkingStorage();
      vi.stubGlobal('localStorage', storage);
      vi.spyOn(storage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const data = { ...INITIAL_DATA, badgeCollection: ['brave-breather' as const] };
      saveData(data);

      // After the write failure, loadData should return the in-memory data
      const loaded = loadData();
      expect(loaded).toEqual(data);
    });
  });

  // ---------------------------------------------------------------------------
  // Test 3: isStorageAvailable() returns false when setItem throws
  // ---------------------------------------------------------------------------
  describe('Test 3: isStorageAvailable returns false when storage throws', () => {
    it('returns false when localStorage.setItem throws', () => {
      const storage = makeWorkingStorage();
      vi.stubGlobal('localStorage', storage);
      vi.spyOn(storage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      expect(isStorageAvailable()).toBe(false);
    });

    it('returns true when localStorage is working normally', () => {
      const storage = makeWorkingStorage();
      vi.stubGlobal('localStorage', storage);

      expect(isStorageAvailable()).toBe(true);
    });
  });
});
