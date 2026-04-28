import type { SessionStep, SessionState } from '../types';

/**
 * Returns true if the given session step is accessible based on current session state.
 * Enforces the ordered session flow.
 */
export function isStepUnlocked(step: SessionStep, session: SessionState): boolean {
  switch (step) {
    case 'body-map':        return session.weatherMetaphor !== null;
    case 'intensity':       return session.bodyRegions.length >= 1;
    case 'name-it':         return session.intensityLevel !== null;
    case 'calm-toolbox':    return session.selectedEmotion !== null;
    case 'reflection':      return session.calmToolsUsed.length >= 1;
    case 'problem-solving': return true; // reached after reflection (even if skipped)
    case 'badge-screen':    return session.nextStep !== null;
    default:                return true;
  }
}
