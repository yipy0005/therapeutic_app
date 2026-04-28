import React, { useContext, createContext } from 'react';
import { SessionProvider, useSession } from './SessionContext';
import { BadgeProvider, useBadge } from './BadgeContext';
import { clearData } from '../storage/adapter';

// ---------------------------------------------------------------------------
// clearAllData context
// ---------------------------------------------------------------------------
interface AppContextValue {
  clearAllData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function AppContextBridge({ children }: { children: React.ReactNode }) {
  const { dispatch } = useSession();
  const { badgeDispatch } = useBadge();

  const clearAllData = () => {
    clearData();
    dispatch({ type: 'RESET_SESSION' });
    badgeDispatch({ type: 'CLEAR_BADGES' });
  };

  return (
    <AppContext.Provider value={{ clearAllData }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AppProvider — wraps both context providers
// ---------------------------------------------------------------------------
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BadgeProvider>
        <AppContextBridge>
          {children}
        </AppContextBridge>
      </BadgeProvider>
    </SessionProvider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
