import type { SessionStep, SessionState } from '../types';
import { POSITIVE_WEATHER } from '../data';

/**
 * Returns true if the given session step is accessible based on current session state.
 * Positive emotions: name-it → share → badge-screen
 * Negative emotions: name-it → calm-toolbox → reflection → problem-solving → badge-screen
 */
export function isStepUnlocked(step: SessionStep, session: SessionState): boolean {
  const isPositive = session.weatherMetaphor !== null && POSITIVE_WEATHER.has(session.weatherMetaphor);

  switch (step) {
    case 'body-map':        return session.weatherMetaphor !== null;
    case 'intensity':       return session.bodyRegions.length >= 1;
    case 'name-it':         return session.intensityLevel !== null;
    case 'share':           return session.selectedEmotions.length > 0 && isPositive;
    case 'calm-toolbox':    return session.selectedEmotions.length > 0 && !isPositive;
    case 'reflection':      return session.calmToolsUsed.length >= 1;
    case 'problem-solving': return true;
    case 'badge-screen':    return session.nextStep !== null;
    default:                return true;
  }
}
