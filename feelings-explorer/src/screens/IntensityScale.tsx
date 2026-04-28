import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { INTENSITY_LABELS } from '../data/index';
import { ParentScriptPanel } from '../components/ParentScriptPanel';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './IntensityScale.module.css';

import volcano1Src from '../assets/intensity/volcano-1.png';
import volcano2Src from '../assets/intensity/volcano-2.png';
import volcano3Src from '../assets/intensity/volcano-3.png';
import volcano4Src from '../assets/intensity/volcano-4.png';
import volcano5Src from '../assets/intensity/volcano-5.png';
import volcanoScaleSrc from '../assets/intensity/volcano-scale.png';

// ---------------------------------------------------------------------------
// Pure helper — exported for property-based tests
// ---------------------------------------------------------------------------
export function shouldShowIntensityGuidance(level: number): boolean {
  return level >= 4;
}

// ---------------------------------------------------------------------------
// Volcano visual config per level
// ---------------------------------------------------------------------------
interface LevelConfig {
  src: string;
}

const LEVEL_CONFIG: Record<number, LevelConfig> = {
  1: { src: volcano1Src },
  2: { src: volcano2Src },
  3: { src: volcano3Src },
  4: { src: volcano4Src },
  5: { src: volcano5Src },
};

// ---------------------------------------------------------------------------
// IntensityScale screen
// ---------------------------------------------------------------------------
export function IntensityScale() {
  const { dispatch, sessionState } = useSession();
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleSelect = (level: number) => {
    setSelectedLevel(level);
  };

  const handleNext = () => {
    if (selectedLevel === null) return;
    dispatch({ type: 'SET_INTENSITY', payload: selectedLevel as 1 | 2 | 3 | 4 | 5 });
    navigate('/name-it');
  };

  const showGuidance = selectedLevel !== null && shouldShowIntensityGuidance(selectedLevel);

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/body-map')} />
      <h1 className={styles.prompt}>
        How big is your feeling?
        <SpeakerButton text="How big is your feeling?" />
      </h1>

      <img src={volcanoScaleSrc} alt="Volcano intensity scale" className={styles.scaleImg} />

      <div className={styles.levelList} role="group" aria-label="Intensity levels">
        {([1, 2, 3, 4, 5] as const).map((level) => {
          const config = LEVEL_CONFIG[level];
          const label = INTENSITY_LABELS[level];
          const isSelected = selectedLevel === level;

          return (
            <button
              key={level}
              type="button"
              className={`${styles.levelButton} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(level)}
              aria-pressed={isSelected}
              aria-label={`Level ${level}: ${label}`}
            >
              <img
                src={config.src}
                alt=""
                className={styles.volcanoImg}
                data-level={level}
                aria-hidden="true"
              />
              <span className={styles.levelInfo}>
                <span className={styles.levelNumber}>Level {level}</span>
                <span className={styles.levelLabel}>{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {showGuidance && (
        <p className={styles.guidanceMessage}>
          Your feeling is a {selectedLevel}. That means we don&apos;t need to solve the problem
          yet. First, we help your body feel safe.
        </p>
      )}

      {showGuidance && (
        <div className={styles.parentScriptPanel}>
          <ParentScriptPanel weather={sessionState.weatherMetaphor ?? undefined} />
        </div>
      )}

      <button
        type="button"
        className={styles.nextButton}
        disabled={selectedLevel === null}
        onClick={handleNext}
        aria-disabled={selectedLevel === null}
      >
        Next →
      </button>
      <ProgressIndicator currentStep="intensity" />
    </main>
  );
}
