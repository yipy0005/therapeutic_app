import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import styles from './ProblemSolving.module.css';

// ---------------------------------------------------------------------------
// Next-step tile definitions
// "Repair / Say Sorry" must NOT be at index 0
// ---------------------------------------------------------------------------
interface NextStepTile {
  emoji: string;
  label: string;
  encouragement: string;
}

const NEXT_STEPS: NextStepTile[] = [
  { emoji: '🙋', label: 'Ask for Help', encouragement: "That's so brave — asking for help is a superpower!" },
  { emoji: '🗣️', label: 'Use Words', encouragement: 'Using your words is a really grown-up thing to do!' },
  { emoji: '⏸️', label: 'Take a Break', encouragement: 'Taking a break is a great way to reset and feel better.' },
  { emoji: '💪', label: 'Try Again', encouragement: "You've got this! Trying again shows real courage." },
  { emoji: '📋', label: 'Make a Plan', encouragement: 'Making a plan is such a smart idea!' },
  { emoji: '🔄', label: 'Ask for a Turn', encouragement: 'Waiting for your turn is a kind and patient choice.' },
  { emoji: '✅', label: 'Tell the Truth', encouragement: 'Telling the truth takes real bravery — well done!' },
  { emoji: '🍃', label: 'Let It Go', encouragement: 'Letting it go can feel really freeing. Great choice!' },
  { emoji: '🤝', label: 'Repair / Say Sorry', encouragement: 'Saying sorry is one of the kindest things you can do!' },
];

// ---------------------------------------------------------------------------
// ProblemSolving screen
// ---------------------------------------------------------------------------
export function ProblemSolving() {
  const { dispatch } = useSession();
  const navigate = useNavigate();

  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (label: string) => {
    setSelected(label);
  };

  const handleDone = () => {
    if (!selected) return;
    dispatch({ type: 'SET_NEXT_STEP', payload: selected });
    dispatch({ type: 'SET_STEP', payload: 'badge-screen' });
    navigate('/badge-screen');
  };

  const encouragement = selected
    ? NEXT_STEPS.find((t) => t.label === selected)?.encouragement ?? 'Great choice!'
    : null;

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/reflection')} />
      <h1 className={styles.heading}>What can you try next?</h1>
      <p className={styles.subheading}>Pick one brave next step.</p>

      <div
        className={styles.tileGrid}
        role="group"
        aria-label="Next step options"
      >
        {NEXT_STEPS.map(({ emoji, label }) => {
          const isSelected = selected === label;
          return (
            <button
              key={label}
              type="button"
              className={`${styles.tile} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleSelect(label)}
              aria-pressed={isSelected}
              aria-label={label}
            >
              <span className={styles.tileEmoji} aria-hidden="true">
                {emoji}
              </span>
              <span className={styles.tileLabel}>{label}</span>
            </button>
          );
        })}
      </div>

      {encouragement && (
        <p className={styles.encouragement} role="status" aria-live="polite">
          {encouragement}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.doneButton}
          onClick={handleDone}
          disabled={!selected}
          aria-disabled={!selected}
        >
          Done ✓
        </button>
      </div>
      <ProgressIndicator currentStep="problem-solving" />
    </main>
  );
}
