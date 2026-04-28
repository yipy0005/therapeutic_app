// Feature: feelings-explorer, Property 3: badge evaluation is deterministic

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { SessionState, WeatherMetaphor, BodyRegion, SessionStep } from '../types';
import { CALM_TOOLS } from '../data';
import { evaluateBadges } from '../utils/badges';

/**
 * Validates: Requirements 9.1, 9.2
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

const calmToolIdArb = fc.constantFrom(...Object.keys(CALM_TOOLS));

const reflectionResponsesArb = fc.dictionary(
  fc.integer({ min: 0, max: 10 }).map(String),
  fc.array(fc.string(), { maxLength: 5 })
);

const nextStepArb = fc.oneof(
  fc.constant(null),
  fc.constantFrom(
    'Repair / Say Sorry',
    'Try Again',
    'Ask for Help',
    'Take a Break',
    'Talk About It',
    'Walk Away',
    'Make a Plan',
    'Ignore It',
    'Something Else'
  )
);

function arbitraryCompletedSession(): fc.Arbitrary<SessionState> {
  return fc.record({
    weatherMetaphor: fc.oneof(fc.constant(null), weatherMetaphorArb),
    bodyRegions: fc.array(bodyRegionArb, { maxLength: 6 }),
    intensityLevel: intensityLevelArb,
    selectedEmotion: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
    calmToolsUsed: fc.array(calmToolIdArb, { maxLength: 11 }),
    reflectionResponses: reflectionResponsesArb,
    nextStep: nextStepArb,
    currentStep: sessionStepArb,
  });
}

// ---------------------------------------------------------------------------
// Property 3: Badge evaluation is deterministic
// ---------------------------------------------------------------------------

describe('Property 3: badge evaluation is deterministic', () => {
  it('evaluateBadges called twice on the same session yields identical results', () => {
    fc.assert(
      fc.property(arbitraryCompletedSession(), (session) => {
        const first = evaluateBadges(session);
        const second = evaluateBadges(session);
        expect(JSON.stringify(first.sort())).toBe(JSON.stringify(second.sort()));
      }),
      { numRuns: 100 }
    );
  });
});
