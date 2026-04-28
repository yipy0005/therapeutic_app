import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppProvider';
import styles from './ParentSafetySection.module.css';

// ---------------------------------------------------------------------------
// Escalation scenario data
// ---------------------------------------------------------------------------
const SCENARIOS = [
  {
    emoji: '🩺',
    title: 'Talk to your Paediatrician',
    body: "If your child's emotional difficulties are affecting their sleep, eating, or physical health, or if you're concerned about development.",
  },
  {
    emoji: '🏫',
    title: 'Contact a School Counsellor',
    body: 'If emotions are affecting learning, friendships, or behaviour at school. School counsellors can also connect you with further support.',
  },
  {
    emoji: '🧠',
    title: 'See a Child Psychologist',
    body: "If your child experiences intense, frequent, or prolonged emotional distress, anxiety, or behavioural challenges that don't improve over time.",
  },
] as const;

// ---------------------------------------------------------------------------
// AdultConfirmGate
// ---------------------------------------------------------------------------
interface GateProps {
  onConfirm: () => void;
  onBack: () => void;
}

function AdultConfirmGate({ onConfirm, onBack }: GateProps) {
  return (
    <div className={styles.gateWrapper}>
      <span className={styles.gateEmoji} aria-hidden="true">👋</span>
      <p className={styles.gatePrompt}>Are you a grown-up?</p>
      <div className={styles.gateActions}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={onConfirm}
        >
          Yes, I'm a grown-up 👋
        </button>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SafetyContent
// ---------------------------------------------------------------------------
interface SafetyContentProps {
  onBack: () => void;
}

function SafetyContent({ onBack }: SafetyContentProps) {
  const { clearAllData } = useApp();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearConfirm = () => {
    clearAllData();
    navigate('/');
  };

  return (
    <>
      <h1 className={styles.heading}>When to Get Extra Help 💙</h1>
      <p className={styles.disclaimer}>
        This app is a tool to support emotional learning — it is not a substitute
        for professional mental health support.
      </p>
      <ul className={styles.cardList} aria-label="Escalation scenarios">
        {SCENARIOS.map((s) => (
          <li key={s.title} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardEmoji} aria-hidden="true">{s.emoji}</span>
              <span className={styles.cardTitle}>{s.title}</span>
            </div>
            <p className={styles.cardBody}>{s.body}</p>
          </li>
        ))}
      </ul>

      {showConfirm ? (
        <div className={styles.confirmDialog} role="alertdialog" aria-labelledby="confirm-title">
          <p id="confirm-title" className={styles.confirmMessage}>
            Are you sure? This will delete all badges and session history.
          </p>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={styles.destructiveButton}
              onClick={handleClearConfirm}
            >
              Yes, delete everything
            </button>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={styles.clearDataButton}
          onClick={() => setShowConfirm(true)}
        >
          🗑️ Clear All Data
        </button>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          ← Back to Home
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ParentSafetySection — top-level screen
// ---------------------------------------------------------------------------
export function ParentSafetySection() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className={styles.screen}>
      {confirmed ? (
        <SafetyContent onBack={() => navigate('/')} />
      ) : (
        <AdultConfirmGate
          onConfirm={() => setConfirmed(true)}
          onBack={() => navigate('/')}
        />
      )}
    </main>
  );
}
