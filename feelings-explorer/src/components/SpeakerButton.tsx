import React from 'react';
import { useNarration } from '../hooks/useNarration';
import styles from './SpeakerButton.module.css';

interface SpeakerButtonProps {
  text: string;
}

export function SpeakerButton({ text }: SpeakerButtonProps) {
  const { speak, isAvailable } = useNarration();

  if (!isAvailable) return null;

  return (
    <button
      type="button"
      className={styles.button}
      aria-label="Read aloud"
      onClick={() => speak(text)}
    >
      🔊
    </button>
  );
}
