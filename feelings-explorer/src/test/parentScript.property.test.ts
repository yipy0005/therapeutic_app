// Feature: feelings-explorer, Property 8: parent script is non-empty for all weather
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { PARENT_SCRIPTS, ALL_WEATHER_METAPHORS } from '../data';

/**
 * Validates: Requirements 6.1, 6.2
 *
 * Property 8: PARENT_SCRIPTS contains a non-empty string for every WeatherMetaphor.
 */
describe('PARENT_SCRIPTS', () => {
  it('has a non-empty string for every WeatherMetaphor', () => {
    fc.assert(
      fc.property(fc.constantFrom(...ALL_WEATHER_METAPHORS), (weather) => {
        const script = PARENT_SCRIPTS[weather];
        return typeof script === 'string' && script.trim().length > 0;
      }),
      { numRuns: 100 },
    );
  });
});
