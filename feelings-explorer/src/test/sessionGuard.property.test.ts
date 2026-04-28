// Feature: feelings-explorer, Property 2: step unlock is monotone — enriching state never locks a previously unlocked step

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { SessionState, SessionStep, WeatherMetaphor, BodyRegion } from '../types';
import { isStepUnlocked } from '../utils/sessionGuard';

/**
 * Validates: Requirements 14.1, 14.2, 14.3
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

const sessionStateArb: fc.Arbitrary<SessionState> = fc.record({
  weatherMetaphor: fc.oneof(fc.constant(null), weatherMetaphorArb),
  bodyRegions: fc.array(bodyRegionArb, { maxLength: 6 }),
  intensityLevel: intensityLevelArb,
  selectedEmotions: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 4 }),
  calmToolsUsed: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
  reflectionResponses: fc.dictionary(
    fc.integer({ min: 0, max: 10 }).map(String),
    fc.array(fc.string(), { maxLength: 5 })
  ),
  nextStep: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
  currentStep: sessionStepArb,
});

/**
 * "Enriching" a state means adding more data — more body regions, setting
 * previously-null fields, adding calm tools, etc. This must never cause a
 * previously-unlocked step to become locked.
 */
function enrichState(state: SessionState): SessionState {
  const extraRegions: BodyRegion[] = ['head', 'chest', 'hands'];
  const mergedRegions = Array.from(new Set([...state.bodyRegions, ...extraRegions])) as BodyRegion[];

  return {
    ...state,
    bodyRegions: mergedRegions,
    weatherMetaphor: state.weatherMetaphor ?? 'sunny',
    intensityLevel: state.intensityLevel ?? 3,
    selectedEmotions: state.selectedEmotions.length > 0 ? state.selectedEmotions : ['Happy'],
    calmToolsUsed: state.calmToolsUsed.length > 0
      ? state.calmToolsUsed
      : [...state.calmToolsUsed, 'smell-flower'],
    nextStep: state.nextStep ?? 'Try Again',
  };
}

// ---------------------------------------------------------------------------
// Property 2: Step unlock is monotone
// ---------------------------------------------------------------------------

describe('Property 2: step unlock is monotone — enriching state never locks a previously unlocked step', () => {
  it('if isStepUnlocked(step, state) is true, it remains true after enriching the state', () => {
    fc.assert(
      fc.property(sessionStateArb, sessionStepArb, (state, step) => {
        const before = isStepUnlocked(step, state);
        const enriched = enrichState(state);
        const after = isStepUnlocked(step, enriched);
        // Monotonicity: if unlocked before enrichment, must still be unlocked after
        return !before || after;
      }),
      { numRuns: 200 }
    );
  });
});
