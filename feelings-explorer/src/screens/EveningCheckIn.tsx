import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData, saveData } from '../storage/adapter';
import type { EveningCheckInRecord } from '../types';
import styles from './EveningCheckIn.module.css';

// ---------------------------------------------------------------------------
// Prompt 1 — Feeling (weather metaphor icons, same 7 as home screen)
// ---------------------------------------------------------------------------
const FEELING_OPTIONS = [
  { emoji: '☀️',  label: 'Sunny' },
  { emoji: '🌧️', label: 'Rainy' },
  { emoji: '⛈️', label: 'Stormy' },
  { emoji: '🌫️', label: 'Foggy' },
  { emoji: '💨',  label: 'Windy' },
  { emoji: '✨',  label: 'Sparkly' },
  { emoji: '☁️', label: 'Heavy Clouds' },
];

// ---------------------------------------------------------------------------
// Prompt 2 — Intensity (same 5 levels as IntensityScale)
// ---------------------------------------------------------------------------
const INTENSITY_OPTIONS = [
  { level: 1, emoji: '🌋',   label: 'Tiny feeling' },
  { level: 2, emoji: '🌋',   label: 'Growing feeling' },
  { level: 3, emoji: '🌋',   label: 'Big feeling' },
  { level: 4, emoji: '🌋💨', label: 'Too big' },
  { level: 5, emoji: '🌋💥', label: 'Eruption / meltdown' },
];

// ---------------------------------------------------------------------------
// Prompt 3 — What helped (calm tool categories + "nothing yet")
// ---------------------------------------------------------------------------
const WHAT_HELPED_OPTIONS = [
  { emoji: '🌬️', label: 'Breathing' },
  { emoji: '🤸', label: 'Body movement' },
  { emoji: '👂', label: 'Sensory calm' },
  { emoji: '🤝', label: 'Connection' },
  { emoji: '🤷', label: 'Nothing yet' },
];

// ---------------------------------------------------------------------------
// Prompt 4 — Proud of
// ---------------------------------------------------------------------------
const PROUD_OF_OPTIONS = [
  { emoji: '🗣️', label: 'I used my words' },
  { emoji: '🤝', label: 'I helped someone' },
  { emoji: '💪', label: 'I tried something hard' },
  { emoji: '🧘', label: 'I stayed calm' },
  { emoji: '⭐', label: 'I tried again' },
  { emoji: '🌟', label: 'Something else' },
];

// ---------------------------------------------------------------------------
// Prompt definitions
// ---------------------------------------------------------------------------
type PromptKey = 'feeling' | 'intensity' | 'whatHelped' | 'proudOf';

interface Prompt {
  key: PromptKey;
  question: string;
  options: { emoji: string; label: string; level?: number }[];
}

const PROMPTS: Prompt[] = [
  {
    key: 'feeling',
    question: 'What was one feeling you had today?',
    options: FEELING_OPTIONS,
  },
  {
    key: 'intensity',
    question: 'How big was it?',
    options: INTENSITY_OPTIONS,
  },
  {
    key: 'whatHelped',
    question: 'What helped?',
    options: WHAT_HELPED_OPTIONS,
  },
  {
    key: 'proudOf',
    question: 'What are you proud of?',
    options: PROUD_OF_OPTIONS,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// EveningCheckIn screen
// ---------------------------------------------------------------------------
export function EveningCheckIn() {
  const navigate = useNavigate();

  const [promptIndex, setPromptIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Accumulated responses
  const [responses, setResponses] = useState<EveningCheckInRecord['responses']>({
    feeling: null,
    intensity: null,
    whatHelped: null,
    proudOf: null,
  });

  const currentPrompt = PROMPTS[promptIndex];
  const totalPrompts = PROMPTS.length;

  const handleSelect = (label: string) => {
    setSelected((prev) => (prev === label ? null : label));
  };

  const advance = (value: string | null) => {
    // Build updated responses
    const updated = { ...responses };

    if (currentPrompt.key === 'intensity') {
      // Store numeric level for intensity
      const opt = INTENSITY_OPTIONS.find((o) => o.label === value);
      updated.intensity = opt ? opt.level : null;
    } else {
      (updated as Record<string, string | null>)[currentPrompt.key] = value;
    }

    setResponses(updated);

    if (promptIndex < totalPrompts - 1) {
      setPromptIndex((i) => i + 1);
      setSelected(null);
    } else {
      // Persist to localStorage
      const stored = loadData();
      const record: EveningCheckInRecord = {
        date: getTodayISO(),
        responses: updated,
      };
      stored.eveningCheckIns = [...stored.eveningCheckIns, record];
      saveData(stored);
      setDone(true);
    }
  };

  const handleNext = () => advance(selected);
  const handleSkip = () => advance(null);

  // Closing message screen
  if (done) {
    return (
      <main className={styles.screen}>
        <div className={styles.closing}>
          <span className={styles.closingEmoji} aria-hidden="true">🌙</span>
          <h1 className={styles.closingTitle}>Great check-in!</h1>
          <p className={styles.closingMessage}>Sweet dreams 🌙</p>
          <button
            type="button"
            className={styles.homeButton}
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
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
      <h1 className={styles.prompt}>{currentPrompt.question}</h1>

      {/* Options */}
      <div
        className={styles.optionGrid}
        role="group"
        aria-label={currentPrompt.question}
      >
        {currentPrompt.options.map(({ emoji, label }) => {
          const isSelected = selected === label;
          return (
            <button
              key={label}
              type="button"
              className={`${styles.optionTile} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(label)}
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
    </main>
  );
}
