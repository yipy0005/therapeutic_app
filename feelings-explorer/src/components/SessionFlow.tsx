import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { isStepUnlocked } from '../utils/sessionGuard';
import { POSITIVE_WEATHER } from '../data';
import type { SessionStep } from '../types';

// Maps route paths to session steps
const ROUTE_TO_STEP: Record<string, SessionStep> = {
  '/body-map':        'body-map',
  '/intensity':       'intensity',
  '/name-it':         'name-it',
  '/share':           'share',
  '/calm-toolbox':    'calm-toolbox',
  '/reflection':      'reflection',
  '/problem-solving': 'problem-solving',
  '/badge-screen':    'badge-screen',
};

// Maps session steps to route paths
const STEP_TO_ROUTE: Record<SessionStep, string> = {
  'home':            '/',
  'body-map':        '/body-map',
  'intensity':       '/intensity',
  'name-it':         '/name-it',
  'share':           '/share',
  'calm-toolbox':    '/calm-toolbox',
  'calm-activity':   '/calm-toolbox',
  'reflection':      '/reflection',
  'problem-solving': '/problem-solving',
  'badge-screen':    '/badge-screen',
};

// Ordered session steps — both flows share the same guard logic
const SESSION_STEPS: SessionStep[] = [
  'body-map',
  'intensity',
  'name-it',
  'share',
  'calm-toolbox',
  'reflection',
  'problem-solving',
  'badge-screen',
];

export function SessionFlow() {
  const { sessionState } = useSession();
  const location = useLocation();

  const currentStep = ROUTE_TO_STEP[location.pathname];

  if (!currentStep) return <Outlet />;

  if (!isStepUnlocked(currentStep, sessionState)) {
    // Redirect to the earliest step that is unlocked for this session's valence
    const isPositive = sessionState.weatherMetaphor !== null &&
      POSITIVE_WEATHER.has(sessionState.weatherMetaphor);

    // Filter steps relevant to the current flow
    const relevantSteps = SESSION_STEPS.filter((s) => {
      if (s === 'share') return isPositive;
      if (s === 'calm-toolbox' || s === 'reflection' || s === 'problem-solving') return !isPositive;
      return true;
    });

    const earliestUnlocked = relevantSteps.find((step) =>
      isStepUnlocked(step, sessionState)
    );

    return <Navigate to={earliestUnlocked ? STEP_TO_ROUTE[earliestUnlocked] : '/'} replace />;
  }

  return <Outlet />;
}
