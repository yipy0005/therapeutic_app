/**
 * Unit tests for badge earning logic
 * Validates: Requirements 9.1, 9.2
 */
import { describe, it, expect } from 'vitest';
import { evaluateBadges } from '../utils/badges';
import { mergeBadges } from '../utils/badges';
import type { SessionState } from '../types';

// ---------------------------------------------------------------------------
// Base session — no badge conditions met
// ---------------------------------------------------------------------------
function baseSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    weatherMetaphor: null,
    bodyRegions: [],
    intensityLevel: null,
    selectedEmotion: null,
    calmToolsUsed: [],
    reflectionResponses: {},
    nextStep: null,
    currentStep: 'badge-screen',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// evaluateBadges — individual badge conditions
// ---------------------------------------------------------------------------

describe('evaluateBadges', () => {
  it('returns empty array when no conditions are met (Req 9.1)', () => {
    expect(evaluateBadges(baseSession())).toEqual([]);
  });

  it('awards feeling-detective when selectedEmotion is not null (Req 9.2)', () => {
    const session = baseSession({ selectedEmotion: 'Angry' });
    expect(evaluateBadges(session)).toContain('feeling-detective');
  });

  it('does NOT award feeling-detective when selectedEmotion is null (Req 9.2)', () => {
    const session = baseSession({ selectedEmotion: null });
    expect(evaluateBadges(session)).not.toContain('feeling-detective');
  });

  it('awards brave-breather when a breathing tool is used (Req 9.2)', () => {
    // 'smell-flower' has category === 'breathing'
    const session = baseSession({ calmToolsUsed: ['smell-flower'] });
    expect(evaluateBadges(session)).toContain('brave-breather');
  });

  it('awards brave-breather for any breathing tool (balloon-belly) (Req 9.2)', () => {
    const session = baseSession({ calmToolsUsed: ['balloon-belly'] });
    expect(evaluateBadges(session)).toContain('brave-breather');
  });

  it('does NOT award brave-breather when only non-breathing tools are used (Req 9.2)', () => {
    // 'push-wall' has category === 'body'
    const session = baseSession({ calmToolsUsed: ['push-wall'] });
    expect(evaluateBadges(session)).not.toContain('brave-breather');
  });

  it('awards repair-hero when nextStep is "Repair / Say Sorry" (Req 9.2)', () => {
    const session = baseSession({ nextStep: 'Repair / Say Sorry' });
    expect(evaluateBadges(session)).toContain('repair-hero');
  });

  it('does NOT award repair-hero for other next steps (Req 9.2)', () => {
    const session = baseSession({ nextStep: 'Try Again' });
    expect(evaluateBadges(session)).not.toContain('repair-hero');
  });

  it('awards body-signal-spotter when at least one body region is selected (Req 9.2)', () => {
    const session = baseSession({ bodyRegions: ['chest'] });
    expect(evaluateBadges(session)).toContain('body-signal-spotter');
  });

  it('does NOT award body-signal-spotter when no body regions are selected (Req 9.2)', () => {
    const session = baseSession({ bodyRegions: [] });
    expect(evaluateBadges(session)).not.toContain('body-signal-spotter');
  });

  it('awards kind-words-champion when a connection tool is used (Req 9.2)', () => {
    // 'need-help' has category === 'connection'
    const session = baseSession({ calmToolsUsed: ['need-help'] });
    expect(evaluateBadges(session)).toContain('kind-words-champion');
  });

  it('awards kind-words-champion for "can-hug" connection tool (Req 9.2)', () => {
    const session = baseSession({ calmToolsUsed: ['can-hug'] });
    expect(evaluateBadges(session)).toContain('kind-words-champion');
  });

  it('does NOT award kind-words-champion when only non-connection tools are used (Req 9.2)', () => {
    const session = baseSession({ calmToolsUsed: ['look-blue'] });
    expect(evaluateBadges(session)).not.toContain('kind-words-champion');
  });

  it('awards try-again-star when nextStep is "Try Again" (Req 9.2)', () => {
    const session = baseSession({ nextStep: 'Try Again' });
    expect(evaluateBadges(session)).toContain('try-again-star');
  });

  it('does NOT award try-again-star for other next steps (Req 9.2)', () => {
    const session = baseSession({ nextStep: 'Repair / Say Sorry' });
    expect(evaluateBadges(session)).not.toContain('try-again-star');
  });

  it('returns multiple badges when multiple conditions are met (Req 9.2)', () => {
    const session = baseSession({
      selectedEmotion: 'Angry',
      bodyRegions: ['chest'],
      calmToolsUsed: ['smell-flower'],
      nextStep: 'Try Again',
    });
    const badges = evaluateBadges(session);
    expect(badges).toContain('feeling-detective');
    expect(badges).toContain('body-signal-spotter');
    expect(badges).toContain('brave-breather');
    expect(badges).toContain('try-again-star');
  });

  it('returns five badges when all conditions except try-again-star are met (Req 9.2)', () => {
    // repair-hero and try-again-star are mutually exclusive (both depend on nextStep),
    // so the maximum achievable in one session is 5 badges when nextStep is 'Repair / Say Sorry'
    const session = baseSession({
      selectedEmotion: 'Happy',
      bodyRegions: ['tummy'],
      calmToolsUsed: ['smell-flower', 'need-help'],
      nextStep: 'Repair / Say Sorry',
    });
    const badges = evaluateBadges(session);
    expect(badges).toContain('feeling-detective');
    expect(badges).toContain('body-signal-spotter');
    expect(badges).toContain('brave-breather');
    expect(badges).toContain('kind-words-champion');
    expect(badges).toContain('repair-hero');
    expect(badges).not.toContain('try-again-star');
  });

  it('returns results in sorted order (Req 9.1)', () => {
    const session = baseSession({
      selectedEmotion: 'Happy',
      bodyRegions: ['tummy'],
      calmToolsUsed: ['smell-flower', 'need-help'],
      nextStep: 'Try Again',
    });
    const badges = evaluateBadges(session);
    expect(badges).toEqual([...badges].sort());
  });
});

// ---------------------------------------------------------------------------
// mergeBadges
// ---------------------------------------------------------------------------

describe('mergeBadges', () => {
  it('merges new badges into an empty collection', () => {
    const result = mergeBadges([], ['feeling-detective']);
    expect(result).toEqual(['feeling-detective']);
  });

  it('deduplicates badges that already exist in the collection', () => {
    const result = mergeBadges(['feeling-detective'], ['feeling-detective', 'brave-breather']);
    expect(result.filter((b) => b === 'feeling-detective')).toHaveLength(1);
    expect(result).toContain('brave-breather');
  });

  it('returns sorted results', () => {
    const result = mergeBadges(['try-again-star'], ['feeling-detective', 'brave-breather']);
    expect(result).toEqual([...result].sort());
  });

  it('returns all unique badges when there is no overlap', () => {
    const result = mergeBadges(['feeling-detective'], ['brave-breather']);
    expect(result).toContain('feeling-detective');
    expect(result).toContain('brave-breather');
    expect(result).toHaveLength(2);
  });

  it('handles merging empty new badges into existing collection', () => {
    const existing = ['feeling-detective', 'brave-breather'] as const;
    const result = mergeBadges([...existing], []);
    expect(result).toEqual([...existing].sort());
  });

  it('handles merging when both arrays are empty', () => {
    expect(mergeBadges([], [])).toEqual([]);
  });
});
