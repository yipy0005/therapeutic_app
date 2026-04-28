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
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const weather = sessionState.weatherMetaphor;
  const emotions = weather ? WEATHER_EMOTION_MAP[weather] : [];

  const handleCardTap = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleClear = () => {
    setSelectedEmotions([]);
  };

  const handleNext = () => {
    if (selectedEmotions.length === 0 || !weather) return;
    const valence = POSITIVE_WEATHER.has(weather) ? 'positive' : 'negative';
    dispatch({ type: 'SET_EMOTION', payload: { emotions: selectedEmotions, valence } });
    navigate(valence === 'positive' ? '/share' : '/calm-toolbox');
  };

  const hasSelection = selectedEmotions.length > 0;

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/intensity')} />
      <h1 className={styles.prompt}>
        What are you feeling?
        <SpeakerButton text="What is your feeling called?" />
      </h1>

      <div className={styles.cardGrid} role="group" aria-label="Emotion word cards">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotions.includes(emotion);
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

      {hasSelection && (
        <p className={styles.interpolatedPrompt}>
          {selectedEmotions.length === 1
            ? <>I wonder if you&apos;re feeling <strong>{selectedEmotions[0]}</strong> because… Did I get that right?</>
            : <>It sounds like you&apos;re feeling <strong>{selectedEmotions.join(' and ')}</strong>. That&apos;s okay — feelings can mix together!</>
          }
        </p>
      )}

      {hasSelection && (
        <div className={styles.parentScriptPanel}>
          <ParentScriptPanel weather={weather ?? undefined} />
        </div>
      )}

      <div className={styles.actions}>
        {hasSelection && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
          >
            Start over
          </button>
        )}

        <button
          type="button"
          className={styles.nextButton}
          disabled={!hasSelection}
          onClick={handleNext}
          aria-disabled={!hasSelection}
        >
          Next →
        </button>
      </div>
      <ProgressIndicator currentStep="name-it" />
    </main>
  );
}
