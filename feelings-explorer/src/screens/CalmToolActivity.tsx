import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { CALM_TOOLS } from '../data/index';
import styles from './CalmToolActivity.module.css';

import smellFlowerSrc from '../assets/calm-tools/smell-flower.png';
import balloonBellySrc from '../assets/calm-tools/balloon-belly.png';
import dragonBreathSrc from '../assets/calm-tools/dragon-breath.png';
import pushWallSrc from '../assets/calm-tools/push-wall.png';
import needHelpSrc from '../assets/calm-tools/ask-for-help.png';
import canHugSrc from '../assets/calm-tools/hug-stuffie.png';
import turtleShellSrc from '../assets/calm-tools/turtle-shell.png';
import tryAgainSrc from '../assets/calm-tools/try-again.png';

// ---------------------------------------------------------------------------
// Image map for calm tool ids
// ---------------------------------------------------------------------------
const TOOL_IMG: Record<string, string> = {
  'smell-flower':    smellFlowerSrc,
  'balloon-belly':   balloonBellySrc,
  'dragon-breath':   dragonBreathSrc,
  'square-breathing':balloonBellySrc,
  'push-wall':       pushWallSrc,
  'squeeze-fists':   turtleShellSrc,
  'need-help':       needHelpSrc,
  'can-hug':         canHugSrc,
  'turtle-shell':    turtleShellSrc,
  'try-again':       tryAgainSrc,
};

// ---------------------------------------------------------------------------
// BreathingGuide — expanding/contracting CSS shape
// ---------------------------------------------------------------------------
function BreathingGuide() {
  return (
    <div className={styles.breathingContainer} aria-label="Breathing guide animation">
      <div className={styles.breathingCircle} role="img" aria-label="Breathing circle — expand as it grows, breathe out as it shrinks" />
      <p className={styles.breathingLabel}>Breathe in… breathe out…</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CalmToolActivity screen
// ---------------------------------------------------------------------------
export function CalmToolActivity() {
  const { toolId } = useParams<{ toolId: string }>();
  const { dispatch } = useSession();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const tool = toolId ? CALM_TOOLS[toolId] : undefined;

  const handleDone = () => {
    if (!toolId) return;
    // Mark tool as used (append-only via ADD_CALM_TOOL action)
    dispatch({ type: 'ADD_CALM_TOOL', payload: toolId });
    setDone(true);
    navigate('/calm-toolbox');
  };

  const handleBack = () => {
    navigate('/calm-toolbox');
  };

  if (!tool) {
    return (
      <main className={styles.screen}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <p className={styles.notFound}>Activity not found.</p>
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <button type="button" className={styles.backButton} onClick={handleBack} aria-label="Back to calm toolbox">
        ← Back
      </button>

      {TOOL_IMG[tool.id] ? (
        <img
          src={TOOL_IMG[tool.id]}
          alt=""
          className={styles.toolIllustration}
          aria-hidden="true"
        />
      ) : (
        <span className={styles.toolEmoji} aria-hidden="true">
          {tool.id === 'smell-flower' ? '🌸' : tool.id === 'balloon-belly' ? '🎈' : tool.id === 'dragon-breath' ? '🐉' : tool.id === 'push-wall' ? '🧱' : tool.id === 'squeeze-fists' ? '✊' : tool.id === 'shake-sillies' ? '🕺' : tool.id === 'listen-sounds' ? '👂' : tool.id === 'look-blue' ? '🔵' : tool.id === 'need-help' ? '🙋' : tool.id === 'can-hug' ? '🤗' : '⭐'}
        </span>
      )}

      <h1 className={styles.toolTitle}>{tool.label}</h1>
      <p className={styles.instruction}>{tool.instruction}</p>

      {tool.hasBreathingGuide ? (
        <BreathingGuide />
      ) : (
        <div className={styles.activityIllustration} aria-hidden="true" />
      )}

      <button
        type="button"
        className={styles.doneButton}
        onClick={handleDone}
        disabled={done}
        aria-label="Mark activity as done and return to toolbox"
      >
        Done ✓
      </button>
    </main>
  );
}
