// Feature: feelings-explorer, Property 1: weather-emotion mapping is total
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { WEATHER_EMOTION_MAP, ALL_WEATHER_METAPHORS } from '../data';

/**
 * Validates: Requirements 1.4, 4.2
 *
 * Property 1: WEATHER_EMOTION_MAP is total — every WeatherMetaphor maps to a
 * non-empty array of non-empty strings.
 */
describe('WEATHER_EMOTION_MAP property tests', () => {
  it('maps every WeatherMetaphor to a non-empty array of non-empty strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_WEATHER_METAPHORS),
        (weather) => {
          const emotions = WEATHER_EMOTION_MAP[weather];
          // Must be a non-empty array
          if (!Array.isArray(emotions) || emotions.length === 0) return false;
          // Every element must be a non-empty string
          return emotions.every((e) => typeof e === 'string' && e.length > 0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
