import React from 'react';
import type { SessionStep } from '../types';
import styles from './ProgressIndicator.module.css';

// Session steps in order (home excluded, calm-activity excluded)
const STEP_ORDER: SessionStep[] = [
  'body-map',
  'intensity',
  'name-it',
  'calm-toolbox',
  'reflection',
  'problem-solving',
  'badge-screen',
];

interface ProgressIndicatorProps {
  currentStep: SessionStep;
}

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
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
