import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { WEATHER_EMOTION_MAP, POSITIVE_WEATHER } from '../data/index';
import { ParentScriptPanel } from '../components/ParentScriptPanel';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './NameIt.module.css';

// ---------------------------------------------------------------------------
// Emoji map for emotion labels
// ---------------------------------------------------------------------------
const EMOTION_EMOJI: Record<string, string> = {
  // Sunny
  Happy: '😊',
  Proud: '🌟',
  Excited: '🤩',
  Grateful: '🙏',
  Joyful: '😄',
  // Rainy
  Sad: '😢',
  Lonely: '🥺',
  Disappointed: '😞',
  Hurt: '💔',
  // Stormy
  Angry: '😠',
  Frustrated: '😤',
  Annoyed: '😒',
  Jealous: '😒',
  'Treated Unfairly': '😡',
  // Foggy
  Confused: '😕',
  Unsure: '🤔',
  Overwhelmed: '😵',
  Lost: '😶',
  // Windy
  Worried: '😰',
  Nervous: '😬',
  Scared: '😨',
  Anxious: '😟',
  // Sparkly
  Silly: '😜',
  Playful: '🎉',
  Energetic: '⚡',
  Giddy: '🤪',
  // Heavy Clouds
  Tired: '😴',
  Drained: '😪',
  Heavy: '😔',
  Bored: '😑',
  // Shared
  'Left Out': '😿',
};

function getEmoji(label: string): string {
  return EMOTION_EMOJI[label] ?? '💭';
}

// ---------------------------------------------------------------------------
// NameIt screen
// ---------------------------------------------------------------------------
export function NameIt() {
  const { dispatch, sessionState } = useSession();
  const navigate = useNavigate();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const weather = sessionState.weatherMetaphor;
  const emotions = weather ? WEATHER_EMOTION_MAP[weather] : [];

  const handleCardTap = (emotion: string) => {
    setSelectedEmotion((prev) => (prev === emotion ? null : emotion));
  };

  const handleClear = () => {
    setSelectedEmotion(null);
  };

  const handleNext = () => {
    if (!selectedEmotion || !weather) return;
    const valence = POSITIVE_WEATHER.has(weather) ? 'positive' : 'negative';
    dispatch({ type: 'SET_EMOTION', payload: { emotion: selectedEmotion, valence } });
    navigate(valence === 'positive' ? '/share' : '/calm-toolbox');
  };

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/intensity')} />
      <h1 className={styles.prompt}>
        What are you feeling?
        <SpeakerButton text="What is your feeling called?" />
      </h1>

      <div className={styles.cardGrid} role="group" aria-label="Emotion word cards">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotion === emotion;
          return (
            <button
              key={emotion}
              type="button"
              className={`${styles.emotionCard} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleCardTap(emotion)}
              aria-pressed={isSelected}
              aria-label={emotion}
            >
              <span className={styles.cardEmoji} aria-hidden="true">
                {getEmoji(emotion)}
              </span>
              <span className={styles.cardLabel}>{emotion}</span>
            </button>
          );
        })}
      </div>

      {selectedEmotion && (
        <p className={styles.interpolatedPrompt}>
          I wonder if you&apos;re feeling <strong>{selectedEmotion}</strong> because… Did I get
          that right?
        </p>
      )}

      {selectedEmotion && (
        <div className={styles.parentScriptPanel}>
          <ParentScriptPanel weather={weather ?? undefined} />
        </div>
      )}

      <div className={styles.actions}>
        {selectedEmotion && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
          >
            No, it&apos;s more like…
          </button>
        )}

        <button
          type="button"
          className={styles.nextButton}
          disabled={!selectedEmotion}
          onClick={handleNext}
          aria-disabled={!selectedEmotion}
        >
          Next →
        </button>
      </div>
      <ProgressIndicator currentStep="name-it" />
    </main>
  );
}
