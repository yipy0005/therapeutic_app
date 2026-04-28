import React from 'react';
import type { SessionStep } from '../types';
import { useSession } from '../context/SessionContext';
import { POSITIVE_WEATHER } from '../data';
import styles from './ProgressIndicator.module.css';

// Positive flow steps
const POSITIVE_STEPS: SessionStep[] = [
  'body-map', 'intensity', 'name-it', 'share', 'badge-screen',
];

// Negative flow steps
const NEGATIVE_STEPS: SessionStep[] = [
  'body-map', 'intensity', 'name-it', 'calm-toolbox', 'reflection', 'problem-solving', 'badge-screen',
];

interface ProgressIndicatorProps {
  currentStep: SessionStep;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const { sessionState } = useSession();
  const isPositive = sessionState.weatherMetaphor !== null &&
    POSITIVE_WEATHER.has(sessionState.weatherMetaphor);

  const STEP_ORDER = isPositive ? POSITIVE_STEPS : NEGATIVE_STEPS;
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className={styles.container} role="group" aria-label="Session progress">
      {STEP_ORDER.map((step, index) => {
        let dotClass = styles.future;
        if (index < currentIndex) dotClass = styles.completed;
        else if (index === currentIndex) dotClass = styles.active;

        return (
          <span
            key={step}
            className={`${styles.dot} ${dotClass}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}
