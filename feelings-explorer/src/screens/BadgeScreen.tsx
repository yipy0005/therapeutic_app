import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useBadge } from '../context/BadgeContext';
import { evaluateBadges, mergeBadges } from '../utils/badges';
import { saveEmotionRecord } from '../storage/adapter';
import type { BadgeType } from '../types';
import { ProgressIndicator } from '../components/ProgressIndicator';
import styles from './BadgeScreen.module.css';

import feelingDetectiveSrc from '../assets/badges/feeling-detective.png';
import braveBreatherSrc from '../assets/badges/brave-breather.png';
import repairHeroSrc from '../assets/badges/repair-hero.png';
import bodySignalSpotterSrc from '../assets/badges/body-signal-spotter.png';
import kindWordsChampionSrc from '../assets/badges/kind-words-champion.png';
import tryAgainStarSrc from '../assets/badges/try-again-star.png';

// ---------------------------------------------------------------------------
// Badge display info
// ---------------------------------------------------------------------------
const BADGE_INFO: Record<BadgeType, { src: string; name: string }> = {
  'feeling-detective':   { src: feelingDetectiveSrc,   name: 'Feeling Detective' },
  'brave-breather':      { src: braveBreatherSrc,      name: 'Brave Breather' },
  'repair-hero':         { src: repairHeroSrc,         name: 'Repair Hero' },
  'body-signal-spotter': { src: bodySignalSpotterSrc,  name: 'Body Signal Spotter' },
  'kind-words-champion': { src: kindWordsChampionSrc,  name: 'Kind Words Champion' },
  'try-again-star':      { src: tryAgainStarSrc,       name: 'Try-Again Star' },
};

// ---------------------------------------------------------------------------
// BadgeScreen
// ---------------------------------------------------------------------------
export function BadgeScreen() {
  const { sessionState, resetSession } = useSession();
  const { badgeState, badgeDispatch } = useBadge();
  const navigate = useNavigate();

  // Compute newly earned badges once on mount
  const newBadges = evaluateBadges(sessionState);
  const mergedRef = useRef(false);

  useEffect(() => {
    if (mergedRef.current) return;
    mergedRef.current = true;

    // Merge new badges into the persistent badge collection
    const merged = mergeBadges(badgeState.earned, newBadges);
    merged.forEach((badge) => {
      if (!badgeState.earned.includes(badge)) {
        badgeDispatch({ type: 'EARN_BADGE', payload: badge });
      }
    });

    // Save this session to emotion history
    if (sessionState.weatherMetaphor && sessionState.selectedEmotion && sessionState.intensityLevel) {
      const now = new Date();
      saveEmotionRecord({
        id: now.getTime().toString(),
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
        weather: sessionState.weatherMetaphor,
        emotion: sessionState.selectedEmotion,
        valence: sessionState.emotionValence ?? 'negative',
        intensity: sessionState.intensityLevel,
        bodyRegions: sessionState.bodyRegions,
        calmToolsUsed: sessionState.calmToolsUsed,
        nextStep: sessionState.nextStep,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHome = () => {
    resetSession();
    navigate('/');
  };

  return (
    <main className={styles.screen}>
      <h1 className={styles.heading}>
        {newBadges.length > 0 ? '🎉 You earned badges!' : 'Session complete!'}
      </h1>
      <p className={styles.subheading}>
        {newBadges.length > 0
          ? 'Look at all the skills you practised today!'
          : 'Every session helps you grow.'}
      </p>

      {newBadges.length > 0 ? (
        <ul className={styles.badgeList} aria-label="Earned badges">
          {newBadges.map((badge) => {
            const info = BADGE_INFO[badge];
            return (
              <li key={badge} className={styles.badgeCard}>
                <img
                  src={info.src}
                  alt=""
                  className={styles.badgeImg}
                  aria-hidden="true"
                />
                <div className={styles.badgeInfo}>
                  <span className={styles.badgeName}>{info.name}</span>
                  <span className={styles.badgeNew}>New badge!</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.encouragement} role="status">
          <span className={styles.encouragementEmoji} aria-hidden="true">🌟</span>
          <p className={styles.encouragementText}>
            Great job completing the session!
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.homeButton}
          onClick={handleHome}
        >
          🏠 Home
        </button>
      </div>
      <ProgressIndicator currentStep="badge-screen" />
    </main>
  );
}
