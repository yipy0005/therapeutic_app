import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { BadgeState, BadgeType } from '../types';
import { loadData, saveData } from '../storage/adapter';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
export type BadgeAction =
  | { type: 'EARN_BADGE'; payload: BadgeType }
  | { type: 'CLEAR_BADGES' };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function badgeReducer(state: BadgeState, action: BadgeAction): BadgeState {
  switch (action.type) {
    case 'EARN_BADGE':
      if (state.earned.includes(action.payload)) return state;
      return { earned: [...state.earned, action.payload] };
    case 'CLEAR_BADGES':
      return { earned: [] };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface BadgeContextValue {
  badgeState: BadgeState;
  badgeDispatch: React.Dispatch<BadgeAction>;
}

const BadgeContext = createContext<BadgeContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function BadgeProvider({ children }: { children: React.ReactNode }) {
  const stored = loadData();
  const initialState: BadgeState = { earned: stored.badgeCollection ?? [] };

  const [badgeState, badgeDispatch] = useReducer(badgeReducer, initialState);

  // Persist badge collection to localStorage on every change
  useEffect(() => {
    const current = loadData();
    saveData({ ...current, badgeCollection: badgeState.earned });
  }, [badgeState]);

  return (
    <BadgeContext.Provider value={{ badgeState, badgeDispatch }}>
      {children}
    </BadgeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useBadge(): BadgeContextValue {
  const ctx = useContext(BadgeContext);
  if (!ctx) throw new Error('useBadge must be used within a BadgeProvider');
  return ctx;
}
