// Feature: feelings-explorer, Property 5: intensity guidance shown if and only if level >= 4

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shouldShowIntensityGuidance } from '../screens/IntensityScale';

/**
 * Validates: Requirements 3.5, 3.6
 */
describe('Property 5: intensity guidance shown if and only if level >= 4', () => {
  it('shouldShowIntensityGuidance returns true iff level >= 4', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (level) => {
        expect(shouldShowIntensityGuidance(level)).toBe(level >= 4);
      }),
      { numRuns: 100 }
    );
  });
});
