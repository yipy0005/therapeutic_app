import type { BadgeType, SessionState } from '../types';
import { BADGE_CONDITIONS, ALL_BADGE_TYPES } from '../data';

/**
 * Evaluates all badge conditions against a completed session state.
 * Returns a sorted, deterministic array of earned BadgeType values.
 */
export function evaluateBadges(session: SessionState): BadgeType[] {
  const earned = ALL_BADGE_TYPES.filter((badge) => BADGE_CONDITIONS[badge](session));
  return earned.sort();
}

/**
 * Merges newly earned badges into an existing BadgeState, deduplicating.
 * Returns a new sorted array with no duplicates.
 */
export function mergeBadges(existing: BadgeType[], newBadges: BadgeType[]): BadgeType[] {
  const merged = new Set<BadgeType>([...existing, ...newBadges]);
  return Array.from(merged).sort();
}
