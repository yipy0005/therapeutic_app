import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBadge } from '../context/BadgeContext';
import type { BadgeType } from '../types';
import styles from './BadgeCollection.module.css';

import feelingDetectiveSrc from '../assets/badges/feeling-detective.png';
import braveBreatherSrc from '../assets/badges/brave-breather.png';
import repairHeroSrc from '../assets/badges/repair-hero.png';
import bodySignalSpotterSrc from '../assets/badges/body-signal-spotter.png';
import kindWordsChampionSrc from '../assets/badges/kind-words-champion.png';
import tryAgainStarSrc from '../assets/badges/try-again-star.png';

// ---------------------------------------------------------------------------
// Badge display info (image, name, description)
// ---------------------------------------------------------------------------
const BADGE_INFO: Record<BadgeType, { src: string; name: string; description: string }> = {
  'feeling-detective':   { src: feelingDetectiveSrc,   name: 'Feeling Detective',   description: 'Named a feeling' },
  'brave-breather':      { src: braveBreatherSrc,      name: 'Brave Breather',      description: 'Completed a breathing exercise' },
  'repair-hero':         { src: repairHeroSrc,         name: 'Repair Hero',         description: 'Chose to repair and say sorry' },
  'body-signal-spotter': { src: bodySignalSpotterSrc,  name: 'Body Signal Spotter', description: 'Found feelings in your body' },
  'kind-words-champion': { src: kindWordsChampionSrc,  name: 'Kind Words Champion', description: 'Used a connection tool' },
  'try-again-star':      { src: tryAgainStarSrc,       name: 'Try-Again Star',      description: 'Chose to try again' },
};

// ---------------------------------------------------------------------------
// BadgeTile sub-component
// ---------------------------------------------------------------------------
interface BadgeTileProps {
  badge: BadgeType;
}

function BadgeTile({ badge }: BadgeTileProps) {
  const info = BADGE_INFO[badge];
  return (
    <li className={styles.tile}>
      <img src={info.src} alt="" className={styles.tileImg} aria-hidden="true" />
      <div className={styles.tileInfo}>
        <span className={styles.tileName}>{info.name}</span>
        <span className={styles.tileDescription}>{info.description}</span>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// BadgeCollection screen
// ---------------------------------------------------------------------------
export function BadgeCollection() {
  const { badgeState } = useBadge();
  const navigate = useNavigate();

  const earned = badgeState.earned;

  return (
    <main className={styles.screen}>
      <h1 className={styles.heading}>🏅 My Badges</h1>
      <p className={styles.subheading}>
        {earned.length > 0
          ? `You've earned ${earned.length} badge${earned.length === 1 ? '' : 's'}!`
          : 'Keep going — badges are waiting for you!'}
      </p>

      {earned.length > 0 ? (
        <ul className={styles.badgeList} aria-label="Earned badges">
          {earned.map((badge) => (
            <BadgeTile key={badge} badge={badge} />
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState} role="status">
          <span className={styles.emptyEmoji} aria-hidden="true">🌟</span>
          <p className={styles.emptyText}>
            No badges yet — complete a session to earn your first!
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
