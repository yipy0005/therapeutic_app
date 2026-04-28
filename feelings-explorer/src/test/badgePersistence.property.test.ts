// Feature: feelings-explorer, Property 7: badges persist across sessions

import { describe, it, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { expect } from 'vitest';
import type { BadgeType } from '../types';
import { saveData, loadData, _resetFallbackState } from '../storage/adapter';
import { ALL_BADGE_TYPES } from '../data';

/**
 * Validates: Requirements 9.4, 9.5, 9.6, 9.7
 *
 * Property 7: Badges earned in one session are still present after saving
 * and reloading from localStorage.
 */

describe('Property 7: badge collection persists across sessions', () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    const mockLocalStorage: Storage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      get length() { return Object.keys(store).length; },
      key: (index: number) => Object.keys(store)[index] ?? null,
    } as Storage;

    // @ts-ignore
    global.localStorage = mockLocalStorage;
    _resetFallbackState();
  });

  afterEach(() => {
    _resetFallbackState();
  });

  it('badges saved to localStorage are present when loaded back', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...ALL_BADGE_TYPES), { minLength: 1 }),
        (badges: BadgeType[]) => {
          // Reset between runs
          store = {};
          _resetFallbackState();

          // Save badges via saveData
          const current = loadData();
          saveData({ ...current, badgeCollection: badges });

          // Load back and verify all original badges are present
          const loaded = loadData();
          expect(badges.every((b) => loaded.badgeCollection.includes(b))).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
