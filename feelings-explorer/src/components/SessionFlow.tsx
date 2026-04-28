import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { isStepUnlocked } from '../utils/sessionGuard';
import type { SessionStep } from '../types';

// Maps route paths to session steps
const ROUTE_TO_STEP: Record<string, SessionStep> = {
  '/body-map':       'body-map',
  '/intensity':      'intensity',
  '/name-it':        'name-it',
  '/calm-toolbox':   'calm-toolbox',
  '/reflection':     'reflection',
  '/problem-solving':'problem-solving',
  '/badge-screen':   'badge-screen',
};

// Maps session steps to route paths
const STEP_TO_ROUTE: Record<SessionStep, string> = {
  'home':            '/',
  'body-map':        '/body-map',
  'intensity':       '/intensity',
  'name-it':         '/name-it',
  'calm-toolbox':    '/calm-toolbox',
  'calm-activity':   '/calm-toolbox',
  'reflection':      '/reflection',
  'problem-solving': '/problem-solving',
  'badge-screen':    '/badge-screen',
};

// Ordered session steps (excluding home and calm-activity)
const SESSION_STEPS: SessionStep[] = [
  'body-map',
  'intensity',
  'name-it',
  'calm-toolbox',
  'reflection',
  'problem-solving',
  'badge-screen',
];

/**
 * Route guard component that wraps session screen routes.
 * Redirects to the earliest unlocked step if the current route is locked.
 */
export function SessionFlow() {
  const { sessionState } = useSession();
  const location = useLocation();

  const currentStep = ROUTE_TO_STEP[location.pathname];

  // If this route isn't a session step, just render children
  if (!currentStep) {
    return <Outlet />;
  }

  // Check if the current step is unlocked
  if (!isStepUnlocked(currentStep, sessionState)) {
    // Find the earliest unlocked step to redirect to
    const earliestUnlocked = SESSION_STEPS.find((step) =>
      isStepUnlocked(step, sessionState)
    );

    const redirectTo = earliestUnlocked
      ? STEP_TO_ROUTE[earliestUnlocked]
      : '/';

    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
