import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { SessionState } from '../types';
import { loadData, saveData } from '../storage/adapter';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
export type SessionAction =
  | { type: 'SET_WEATHER'; payload: SessionState['weatherMetaphor'] }
  | { type: 'SET_BODY_REGIONS'; payload: SessionState['bodyRegions'] }
  | { type: 'SET_INTENSITY'; payload: SessionState['intensityLevel'] }
  | { type: 'SET_EMOTION'; payload: { emotion: string; valence: SessionState['emotionValence'] } }
  | { type: 'ADD_CALM_TOOL'; payload: string }
  | { type: 'SET_REFLECTION'; payload: { index: number; responses: string[] } }
  | { type: 'SET_NEXT_STEP'; payload: string | null }
  | { type: 'SET_STEP'; payload: SessionState['currentStep'] }
  | { type: 'RESET_SESSION' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
export const INITIAL_SESSION_STATE: SessionState = {
  weatherMetaphor: null,
  bodyRegions: [],
  intensityLevel: null,
  selectedEmotion: null,
  emotionValence: null,
  calmToolsUsed: [],
  reflectionResponses: {},
  nextStep: null,
  currentStep: 'home',
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_WEATHER':
      return { ...state, weatherMetaphor: action.payload };
    case 'SET_BODY_REGIONS':
      return { ...state, bodyRegions: action.payload };
    case 'SET_INTENSITY':
      return { ...state, intensityLevel: action.payload };
    case 'SET_EMOTION':
      return { ...state, selectedEmotion: action.payload.emotion, emotionValence: action.payload.valence };
    case 'ADD_CALM_TOOL':
      if (state.calmToolsUsed.includes(action.payload)) return state;
      return { ...state, calmToolsUsed: [...state.calmToolsUsed, action.payload] };
    case 'SET_REFLECTION':
      return {
        ...state,
        reflectionResponses: {
          ...state.reflectionResponses,
          [action.payload.index]: action.payload.responses,
        },
      };
    case 'SET_NEXT_STEP':
      return { ...state, nextStep: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET_SESSION':
      return { ...INITIAL_SESSION_STATE };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface SessionContextValue {
  sessionState: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const stored = loadData();
  const initialState = stored.currentSession ?? INITIAL_SESSION_STATE;

  const [sessionState, dispatch] = useReducer(sessionReducer, initialState);

  // Persist to localStorage on every state change
  useEffect(() => {
    const current = loadData();
    saveData({ ...current, currentSession: sessionState });
  }, [sessionState]);

  const resetSession = () => dispatch({ type: 'RESET_SESSION' });

  return (
    <SessionContext.Provider value={{ sessionState, dispatch, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
