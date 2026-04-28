import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { CALM_TOOLS } from '../data/index';
import type { CalmTool } from '../types';
import { BackButton } from '../components/BackButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SpeakerButton } from '../components/SpeakerButton';
import styles from './CalmToolbox.module.css';

import smellFlowerSrc from '../assets/calm-tools/smell-flower.png';
import balloonBellySrc from '../assets/calm-tools/balloon-belly.png';
import dragonBreathSrc from '../assets/calm-tools/dragon-breath.png';
import pushWallSrc from '../assets/calm-tools/push-wall.png';
import squeezeFistsSrc from '../assets/calm-tools/turtle-shell.png'; // fallback
import shakeSilliesSrc from '../assets/calm-tools/turtle-shell.png'; // fallback
import listenSoundsSrc from '../assets/calm-tools/drink-water.png';  // fallback
import lookBlueSrc from '../assets/calm-tools/drink-water.png';      // fallback
import needHelpSrc from '../assets/calm-tools/ask-for-help.png';
import canHugSrc from '../assets/calm-tools/hug-stuffie.png';
import turtleShellSrc from '../assets/calm-tools/turtle-shell.png';
import drinkWaterSrc from '../assets/calm-tools/drink-water.png';
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
  'squeeze-fists':   squeezeFistsSrc,
  'shake-sillies':   shakeSilliesSrc,
  'listen-sounds':   listenSoundsSrc,
  'look-blue':       lookBlueSrc,
  'need-help':       needHelpSrc,
  'can-hug':         canHugSrc,
  'turtle-shell':    turtleShellSrc,
  'drink-water':     drinkWaterSrc,
  'try-again':       tryAgainSrc,
};

function getToolImg(id: string): string {
  return TOOL_IMG[id] ?? smellFlowerSrc;
}

// ---------------------------------------------------------------------------
// The ordered list of tools to display (≥5 across all categories)
// ---------------------------------------------------------------------------
const DISPLAYED_TOOL_IDS: string[] = [
  'smell-flower',
  'balloon-belly',
  'dragon-breath',
  'push-wall',
  'squeeze-fists',
  'shake-sillies',
  'listen-sounds',
  'look-blue',
  'need-help',
  'can-hug',
];

// ---------------------------------------------------------------------------
// CalmToolbox screen
// ---------------------------------------------------------------------------
export function CalmToolbox() {
  const { dispatch, sessionState } = useSession();
  const navigate = useNavigate();

  const usedTools = sessionState.calmToolsUsed;
  const hasUsedAtLeastOne = usedTools.length >= 1;

  const handleToolTap = (tool: CalmTool) => {
    navigate(`/calm-activity/${tool.id}`);
  };

  const handleFeelBetter = () => {
    if (!hasUsedAtLeastOne) return;
    dispatch({ type: 'SET_STEP', payload: 'reflection' });
    navigate('/reflection');
  };

  return (
    <main className={styles.screen}>
      <BackButton onClick={() => navigate('/name-it')} />
      <h1 className={styles.prompt}>
        Pick a power 💪
        <SpeakerButton text="Pick a power" />
      </h1>
      <p className={styles.subtitle}>Choose a tool to help your body feel calm</p>

      <div className={styles.toolGrid} role="group" aria-label="Calm tool cards">
        {DISPLAYED_TOOL_IDS.map((id) => {
          const tool = CALM_TOOLS[id];
          if (!tool) return null;
          const isUsed = usedTools.includes(id);

          return (
            <button
              key={id}
              type="button"
              className={`${styles.toolCard} ${isUsed ? styles.used : ''}`}
              onClick={() => handleToolTap(tool)}
              aria-label={tool.label}
            >
              <img
                src={getToolImg(id)}
                alt=""
                className={styles.toolImg}
                aria-hidden="true"
              />
              <span className={styles.toolLabel}>{tool.label}</span>
              <span className={styles.toolInstruction}>{tool.instruction}</span>
              {isUsed && <span className={styles.usedBadge}>✓ Done!</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.feelBetterButton}
          disabled={!hasUsedAtLeastOne}
          onClick={handleFeelBetter}
          aria-disabled={!hasUsedAtLeastOne}
        >
          I feel better 🌈
        </button>
      </div>
      <ProgressIndicator currentStep="calm-toolbox" />
    </main>
  );
}
