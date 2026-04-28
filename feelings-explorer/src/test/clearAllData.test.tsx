/**
 * Unit tests for Clear All Data two-step confirmation in ParentSafetySection
 * Validates: Requirements 13.4, 13.5
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { useSession } from '../context/SessionContext';
import { useBadge } from '../context/BadgeContext';
import { ParentSafetySection } from '../screens/ParentSafetySection';
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

beforeEach(() => {
  localStorageMock.clear();
  _resetFallbackState();
});

// ---------------------------------------------------------------------------
// Helper: renders ParentSafetySection past the adult gate
// ---------------------------------------------------------------------------
function renderSafetySection() {
  let capturedSession: ReturnType<typeof useSession> | null = null;
  let capturedBadge: ReturnType<typeof useBadge> | null = null;
  let capturedLocation: ReturnType<typeof useLocation> | null = null;

  function SessionCapture() {
    capturedSession = useSession();
    return null;
  }

  function BadgeCapture() {
    capturedBadge = useBadge();
    return null;
  }

  function LocationCapture() {
    capturedLocation = useLocation();
    return null;
  }

  const result = render(
    <MemoryRouter initialEntries={['/safety']}>
      <AppProvider>
        <SessionCapture />
        <BadgeCapture />
        <LocationCapture />
        <ParentSafetySection />
      </AppProvider>
    </MemoryRouter>
  );

  return {
    ...result,
    getSession: () => capturedSession!,
    getBadge: () => capturedBadge!,
    getLocation: () => capturedLocation!,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ParentSafetySection — Clear All Data', () => {
  async function confirmAdultGate(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: /yes, i'm a grown-up/i }));
  }

  it('shows confirmation dialog when "Clear All Data" is clicked', async () => {
    const user = userEvent.setup();
    renderSafetySection();

    await confirmAdultGate(user);

    // Confirmation dialog should not be visible yet
    expect(screen.queryByRole('alertdialog')).toBeNull();

    await user.click(screen.getByRole('button', { name: /clear all data/i }));

    // Confirmation dialog should now be visible
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(
      screen.getByText(/are you sure\? this will delete all badges and session history/i)
    ).toBeTruthy();
  });

  it('dismisses the dialog and leaves data intact when "Cancel" is clicked', async () => {
    const user = userEvent.setup();
    const { getSession, getBadge } = renderSafetySection();

    await confirmAdultGate(user);

    // Set some session state first
    act(() => {
      getSession().dispatch({ type: 'SET_WEATHER', payload: 'sunny' });
    });
    act(() => {
      getBadge().badgeDispatch({ type: 'EARN_BADGE', payload: 'feeling-detective' });
    });

    // Open confirmation dialog
    await user.click(screen.getByRole('button', { name: /clear all data/i }));
    expect(screen.getByRole('alertdialog')).toBeTruthy();

    // Cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Dialog dismissed
    expect(screen.queryByRole('alertdialog')).toBeNull();

    // Data still intact
    expect(getSession().sessionState.weatherMetaphor).toBe('sunny');
    expect(getBadge().badgeState.earned).toContain('feeling-detective');
  });

  it('calls clearAllData and navigates to home when "Confirm" is clicked', async () => {
    const user = userEvent.setup();
    const { getSession, getBadge, getLocation } = renderSafetySection();

    await confirmAdultGate(user);

    // Set some state
    act(() => {
      getSession().dispatch({ type: 'SET_WEATHER', payload: 'stormy' });
    });
    act(() => {
      getBadge().badgeDispatch({ type: 'EARN_BADGE', payload: 'brave-breather' });
    });

    expect(getSession().sessionState.weatherMetaphor).toBe('stormy');
    expect(getBadge().badgeState.earned).toContain('brave-breather');

    // Open confirmation dialog
    await user.click(screen.getByRole('button', { name: /clear all data/i }));

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /yes, delete everything/i }));

    // Data cleared
    expect(getSession().sessionState.weatherMetaphor).toBeNull();
    expect(getBadge().badgeState.earned).toHaveLength(0);

    // Navigated to home
    expect(getLocation().pathname).toBe('/');
  });
});
