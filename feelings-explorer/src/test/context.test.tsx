/**
 * Unit tests for context providers
 * Validates: Requirements 13.4, 13.5
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SessionProvider, useSession } from '../context/SessionContext';
import { AppProvider } from '../context/AppProvider';
import { useApp } from '../context/AppProvider';
import { useBadge } from '../context/BadgeContext';
import { _resetFallbackState } from '../storage/adapter';

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorageMock.clear();
  _resetFallbackState();
});

// ---------------------------------------------------------------------------
// SessionContext tests
// ---------------------------------------------------------------------------

describe('SessionContext', () => {
  it('propagates SET_WEATHER dispatch to consumers', () => {
    function Consumer() {
      const { sessionState, dispatch } = useSession();
      return (
        <>
          <span data-testid="weather">{sessionState.weatherMetaphor ?? 'none'}</span>
          <button onClick={() => dispatch({ type: 'SET_WEATHER', payload: 'sunny' })}>
            set weather
          </button>
        </>
      );
    }

    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>
    );

    expect(screen.getByTestId('weather').textContent).toBe('none');

    act(() => {
      screen.getByText('set weather').click();
    });

    expect(screen.getByTestId('weather').textContent).toBe('sunny');
  });

  it('propagates SET_BODY_REGIONS dispatch to consumers', () => {
    function Consumer() {
      const { sessionState, dispatch } = useSession();
      return (
        <>
          <span data-testid="regions">{sessionState.bodyRegions.join(',') || 'none'}</span>
          <button
            onClick={() =>
              dispatch({ type: 'SET_BODY_REGIONS', payload: ['head', 'chest'] })
            }
          >
            set regions
          </button>
        </>
      );
    }

    render(
      <SessionProvider>
        <Consumer />
      </SessionProvider>
    );

    expect(screen.getByTestId('regions').textContent).toBe('none');

    act(() => {
      screen.getByText('set regions').click();
    });

    expect(screen.getByTestId('regions').textContent).toBe('head,chest');
  });
});

// ---------------------------------------------------------------------------
// clearAllData tests
// ---------------------------------------------------------------------------

describe('clearAllData', () => {
  it('resets session state, badge collection, and localStorage', () => {
    function Consumer() {
      const { sessionState, dispatch } = useSession();
      const { badgeState, badgeDispatch } = useBadge();
      const { clearAllData } = useApp();

      return (
        <>
          <span data-testid="weather">{sessionState.weatherMetaphor ?? 'none'}</span>
          <span data-testid="badges">{badgeState.earned.join(',') || 'none'}</span>
          <button onClick={() => dispatch({ type: 'SET_WEATHER', payload: 'stormy' })}>
            set weather
          </button>
          <button
            onClick={() => badgeDispatch({ type: 'EARN_BADGE', payload: 'brave-breather' })}
          >
            earn badge
          </button>
          <button onClick={() => clearAllData()}>clear all</button>
        </>
      );
    }

    render(
      <AppProvider>
        <Consumer />
      </AppProvider>
    );

    // Set some state
    act(() => {
      screen.getByText('set weather').click();
    });
    act(() => {
      screen.getByText('earn badge').click();
    });

    expect(screen.getByTestId('weather').textContent).toBe('stormy');
    expect(screen.getByTestId('badges').textContent).toBe('brave-breather');

    // Clear everything
    act(() => {
      screen.getByText('clear all').click();
    });

    expect(screen.getByTestId('weather').textContent).toBe('none');
    expect(screen.getByTestId('badges').textContent).toBe('none');

    // After clearAllData, localStorage either has no entry or has reset state with no badges/session data
    const stored = localStorage.getItem('feelings-explorer');
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      expect(parsed.badgeCollection).toEqual([]);
      expect(parsed.currentSession?.weatherMetaphor ?? null).toBeNull();
    }
  });
});
