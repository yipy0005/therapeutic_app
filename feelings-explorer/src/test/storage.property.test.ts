// Feature: feelings-explorer, Property 4: session state round-trips through JSON serialisation

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import type { SessionState, StoredData, WeatherMetaphor, BodyRegion, SessionStep, BadgeType } from '../types';
import { saveData, loadData, _resetFallbackState } from '../storage/adapter';

/**
 * Validates: Requirements 13.1, 14.5
 */

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const weatherMetaphorArb = fc.constantFrom<WeatherMetaphor>(
  'sunny', 'rainy', 'stormy', 'foggy', 'windy', 'sparkly', 'heavy-clouds'
);

const bodyRegionArb = fc.constantFrom<BodyRegion>(
  'head', 'throat', 'chest', 'tummy', 'hands', 'legs'
);

const sessionStepArb = fc.constantFrom<SessionStep>(
  'home', 'body-map', 'intensity', 'name-it',
  'calm-toolbox', 'calm-activity', 'reflection', 'problem-solving', 'badge-screen'
);

const intensityLevelArb = fc.oneof(
  fc.constant(null),
  fc.constantFrom<1 | 2 | 3 | 4 | 5>(1, 2, 3, 4, 5)
);

const reflectionResponsesArb = fc.dictionary(
  fc.integer({ min: 0, max: 10 }).map(String),
  fc.array(fc.string(), { maxLength: 5 })
);

const sessionStateArb: fc.Arbitrary<SessionState> = fc.record({
  weatherMetaphor: fc.oneof(fc.constant(null), weatherMetaphorArb),
  bodyRegions: fc.array(bodyRegionArb, { maxLength: 6 }),
  intensityLevel: intensityLevelArb,
  selectedEmotion: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
  calmToolsUsed: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
  reflectionResponses: reflectionResponsesArb,
  nextStep: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
  currentStep: sessionStepArb,
});

const badgeTypeArb = fc.constantFrom<BadgeType>(
  'feeling-detective', 'brave-breather', 'repair-hero',
  'body-signal-spotter', 'kind-words-champion', 'try-again-star'
);

const storedDataArb: fc.Arbitrary<StoredData> = fc.record({
  version: fc.constant(1 as const),
  currentSession: fc.oneof(fc.constant(null), sessionStateArb),
  badgeCollection: fc.array(badgeTypeArb, { maxLength: 6 }),
  eveningCheckIns: fc.array(
    fc.record({
      date: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
        .map(d => d.toISOString().slice(0, 10)),
      responses: fc.record({
        feeling: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
        intensity: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 5 })),
        whatHelped: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 100 })),
        proudOf: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 100 })),
      }),
    }),
    { maxLength: 10 }
  ),
});

// ---------------------------------------------------------------------------
// Property 4a: SessionState round-trips through JSON.stringify / JSON.parse
// ---------------------------------------------------------------------------

describe('Property 4: session state round-trips through JSON serialisation', () => {
  it('SessionState serialises and deserialises to deep equality', () => {
    fc.assert(
      fc.property(sessionStateArb, (state) => {
        const serialised = JSON.stringify(state);
        const deserialised = JSON.parse(serialised) as SessionState;
        expect(deserialised).toEqual(state);
      }),
      { numRuns: 100 }
    );
  });

  // -------------------------------------------------------------------------
  // Property 4b: saveData + loadData round-trips a full StoredData object
  // -------------------------------------------------------------------------

  describe('saveData + loadData round-trip', () => {
    let store: Record<string, string>;
    let mockLocalStorage: Storage;

    beforeEach(() => {
      store = {};
      mockLocalStorage = {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] ?? null,
      } as Storage;
      vi.stubGlobal('localStorage', mockLocalStorage);
      _resetFallbackState();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      _resetFallbackState();
    });

    it('StoredData round-trips through saveData and loadData', () => {
      fc.assert(
        fc.property(storedDataArb, (data) => {
          // Reset state between runs so each run starts clean
          store = {};
          _resetFallbackState();

          saveData(data);
          const loaded = loadData();
          expect(loaded).toEqual(data);
        }),
        { numRuns: 100 }
      );
    });
  });
});
