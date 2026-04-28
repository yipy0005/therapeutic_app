import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { POSITIVE_SHARE_PROMPTS } from '../data/index';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './Share.module.css';

// ---------------------------------------------------------------------------
// Share screen — positive emotion flow
// Encourages the child to share what caused their good feeling (multi-select)
// ---------------------------------------------------------------------------
export function Share() {
  const { dispatch, sessionState } = useSession();
  const navigate = useNavigate();

  const [promptIndex, setPromptIndex] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);

  const totalPrompts = POSITIVE_SHARE_PROMPTS.length;
  const currentPrompt = POSITIVE_SHARE_PROMPTS[promptIndex];
  const emotion = sessionState.selectedEmotion ?? 'great';

  const toggleOption = (label: string) => {
    setSelections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const advance = (responses: string[]) => {
    dispatch({ type: 'SET_REFLECTION', payload: { index: promptIndex, responses } });

    if (promptIndex < totalPrompts - 1) {
      setPromptIndex((i) => i + 1);
      setSelections([]);
    } else {
      // Positive flow skips calm-toolbox, reflection, problem-solving
      // Set a default nextStep so badge-screen unlocks
      dispatch({ type: 'SET_NEXT_STEP', payload: 'shared' });
      dispatch({ type: 'SET_STEP', payload: 'badge-screen' });
      navigate('/badge-screen');
    }
  };

  const handleNext = () => advance(selections);
  const handleSkip = () => advance([]);

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/name-it')} />

      {/* Celebration header on first prompt */}
      {promptIndex === 0 && (
        <div className={styles.celebrationBanner} aria-hidden="true">
          🎉
        </div>
      )}

      <p className={styles.emotionLabel}>
        You&apos;re feeling <strong>{emotion}</strong>!
      </p>

      {/* Progress dots */}
      <div className={styles.progressDots} aria-hidden="true">
        {POSITIVE_SHARE_PROMPTS.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < promptIndex ? styles.done : ''} ${i === promptIndex ? styles.active : ''}`}
          />
        ))}
      </div>

      <h1 className={styles.prompt}>
        {currentPrompt.question}
        <SpeakerButton text={currentPrompt.question} />
      </h1>

      <p className={styles.hint}>Pick as many as you like</p>

      <div
        className={styles.optionGrid}
        role="group"
        aria-label={currentPrompt.question}
        aria-multiselectable="true"
      >
        {currentPrompt.options.map(({ emoji, label }) => {
          const isSelected = selections.includes(label);
          return (
            <button
              key={label}
              type="button"
              className={`${styles.optionTile} ${isSelected ? styles.selected : ''}`}
              onClick={() => toggleOption(label)}
              aria-pressed={isSelected}
              aria-label={label}
            >
              <span className={styles.optionEmoji} aria-hidden="true">{emoji}</span>
              <span className={styles.optionLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.nextButton} onClick={handleNext}>
          {promptIndex < totalPrompts - 1 ? 'Next →' : 'Done ✓'}
        </button>
        <button type="button" className={styles.skipButton} onClick={handleSkip}>
          Skip
        </button>
      </div>

      <ProgressIndicator currentStep="share" />
    </main>
  );
}
