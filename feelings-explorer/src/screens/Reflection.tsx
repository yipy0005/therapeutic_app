import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './Reflection.module.css';

// ---------------------------------------------------------------------------
// Prompt definitions
// ---------------------------------------------------------------------------
interface PromptOption {
  emoji: string;
  label: string;
}

interface ReflectionPrompt {
  question: string;
  options: PromptOption[];
}

const PROMPTS: ReflectionPrompt[] = [
  {
    question: 'What happened?',
    options: [
      { emoji: '😤', label: 'We argued' },
      { emoji: '😢', label: 'I got hurt' },
      { emoji: '😕', label: 'Something felt unfair' },
      { emoji: '😰', label: 'I got scared' },
      { emoji: '😔', label: 'I felt left out' },
      { emoji: '🤷', label: "I don't know" },
    ],
  },
  {
    question: 'What did you feel?',
    options: [
      { emoji: '😠', label: 'Angry' },
      { emoji: '😢', label: 'Sad' },
      { emoji: '😨', label: 'Scared' },
      { emoji: '😕', label: 'Confused' },
      { emoji: '😤', label: 'Frustrated' },
      { emoji: '😔', label: 'Disappointed' },
    ],
  },
  {
    question: 'What did your body want to do?',
    options: [
      { emoji: '🏃', label: 'Run away' },
      { emoji: '🤜', label: 'Hit something' },
      { emoji: '🙈', label: 'Hide' },
      { emoji: '😭', label: 'Cry' },
      { emoji: '🤐', label: 'Go quiet' },
      { emoji: '🤗', label: 'Get a hug' },
    ],
  },
  {
    question: 'What can we try next time?',
    options: [
      { emoji: '🗣️', label: 'Use words' },
      { emoji: '🧘', label: 'Take a breath' },
      { emoji: '🙋', label: 'Ask for help' },
      { emoji: '⏸️', label: 'Take a break' },
      { emoji: '🤝', label: 'Talk it out' },
      { emoji: '💪', label: 'Try again' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Reflection screen
// ---------------------------------------------------------------------------
export function Reflection() {
  const { dispatch } = useSession();
  const navigate = useNavigate();

  const [promptIndex, setPromptIndex] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);

  const currentPrompt = PROMPTS[promptIndex];
  const totalPrompts = PROMPTS.length;

  const toggleOption = (label: string) => {
    setSelections((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const advance = (responses: string[]) => {
    // Persist this prompt's responses
    dispatch({ type: 'SET_REFLECTION', payload: { index: promptIndex, responses } });

    if (promptIndex < totalPrompts - 1) {
      setPromptIndex((i) => i + 1);
      setSelections([]);
    } else {
      // All prompts done — navigate to problem-solving
      dispatch({ type: 'SET_STEP', payload: 'problem-solving' });
      navigate('/problem-solving');
    }
  };

  const handleNext = () => advance(selections);
  const handleSkip = () => advance([]);

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/calm-toolbox')} />
      {/* Progress */}
      <p className={styles.progress}>
        {promptIndex + 1} of {totalPrompts}
      </p>
      <div className={styles.progressDots} aria-hidden="true">
        {PROMPTS.map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < promptIndex ? styles.done : ''} ${i === promptIndex ? styles.active : ''}`}
          />
        ))}
      </div>

      {/* Prompt */}
      <h1 className={styles.prompt}>
        {currentPrompt.question}
        <SpeakerButton text={currentPrompt.question} />
      </h1>

      {/* Options */}
      <div
        className={styles.optionGrid}
        role="group"
        aria-label={currentPrompt.question}
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
              <span className={styles.optionEmoji} aria-hidden="true">
                {emoji}
              </span>
              <span className={styles.optionLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button type="button" className={styles.nextButton} onClick={handleNext}>
          {promptIndex < totalPrompts - 1 ? 'Next →' : 'Done ✓'}
        </button>
        <button type="button" className={styles.skipButton} onClick={handleSkip}>
          Skip
        </button>
      </div>
      <ProgressIndicator currentStep="reflection" />
    </main>
  );
}
