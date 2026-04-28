import React from 'react';
import type { WeatherMetaphor } from '../types';
import { PARENT_SCRIPTS, DEFAULT_PARENT_SCRIPT } from '../data/index';
import styles from './ParentScriptPanel.module.css';

interface ParentScriptPanelProps {
  weather?: WeatherMetaphor;
}

export function ParentScriptPanel({ weather }: ParentScriptPanelProps) {
  const script = weather ? PARENT_SCRIPTS[weather] : DEFAULT_PARENT_SCRIPT;

  return (
    <div data-testid="parent-script-panel" className={styles.panel}>
      <p className={styles.label}>For Grown-Ups 👋</p>
      <p className={styles.script}>{script}</p>
    </div>
  );
}
