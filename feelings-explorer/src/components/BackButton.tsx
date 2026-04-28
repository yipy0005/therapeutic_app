import React from 'react';
import styles from './BackButton.module.css';

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      className={styles.button}
      onClick={onClick}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
