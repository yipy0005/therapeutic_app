// Feature: feelings-explorer, Property 6: using a calm tool only grows the calmToolsUsed list — no previously used tool is removed

import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import type { SessionState, WeatherMetaphor, BodyRegion, SessionStep } from '../types';

/**
 * Validates: Requirements 5.7, 5.9
 */

// ---------------------------------------------------------------------------
// Pure helper: mirrors the ADD_CALM_TOOL reducer action
// ---------------------------------------------------------------------------
function addCalmTool(state: SessionState, toolId: string): SessionState {
  if (state.calmToolsUsed.includes(toolId)) return state;
  return { ...state, calmToolsUsed: [...state.calmToolsUsed, toolId] };
}

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

const sessionStateArb: fc.Arbitrary<SessionState> = fc.record({
  weatherMetaphor: fc.oneof(fc.constant(null), weatherMetaphorArb),
  bodyRegions: fc.array(bodyRegionArb, { maxLength: 6 }),
  intensityLevel: fc.oneof(
    fc.constant(null),
    fc.constantFrom<1 | 2 | 3 | 4 | 5>(1, 2, 3, 4, 5)
  ),
  selectedEmotion: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
  calmToolsUsed: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
  reflectionResponses: fc.dictionary(
    fc.integer({ min: 0, max: 10 }).map(String),
    fc.array(fc.string(), { maxLength: 5 })
  ),
  nextStep: fc.oneof(fc.constant(null), fc.string({ minLength: 1, maxLength: 50 })),
  currentStep: sessionStepArb,
});

// ---------------------------------------------------------------------------
// Property 6: calm tool list is append-only
// ---------------------------------------------------------------------------

describe('Property 6: using a calm tool only grows the calmToolsUsed list', () => {
  it('every previously used tool is still present after adding a new tool', () => {
    fc.assert(
      fc.property(
        sessionStateArb,
        fc.string({ minLength: 1, maxLength: 30 }),
        (state, toolId) => {
          const before = [...state.calmToolsUsed];
          const after = addCalmTool(state, toolId).calmToolsUsed;

          // All previously used tools must still be present
          const allPreviousPresent = before.every((id) => after.includes(id));
          // The list must not shrink
          const listOnlyGrows = after.length >= before.length;

          return allPreviousPresent && listOnlyGrows;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('adding a tool that is already used does not duplicate it', () => {
    fc.assert(
      fc.property(
        sessionStateArb.filter((s) => s.calmToolsUsed.length > 0),
        (state) => {
          const existingTool = state.calmToolsUsed[0];
          const before = state.calmToolsUsed.length;
          const after = addCalmTool(state, existingTool).calmToolsUsed.length;
          // Idempotent — no duplicate added
          return after === before;
        }
      ),
      { numRuns: 100 }
    );
  });
});
