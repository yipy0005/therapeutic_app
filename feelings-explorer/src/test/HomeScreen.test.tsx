/**
 * Unit tests for HomeScreen
 * Validates: Requirements 1.1, 1.3
 */
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { useSession } from '../context/SessionContext';
import { HomeScreen } from '../screens/HomeScreen';
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
// Helper: renders HomeScreen with all required providers
// ---------------------------------------------------------------------------
function renderHomeScreen(initialPath = '/') {
  let capturedSession: ReturnType<typeof useSession> | null = null;
  let capturedLocation: ReturnType<typeof useLocation> | null = null;

  function SessionCapture() {
    capturedSession = useSession();
    return null;
  }

  function LocationCapture() {
    capturedLocation = useLocation();
    return null;
  }

  const result = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppProvider>
        <SessionCapture />
        <LocationCapture />
        <HomeScreen />
      </AppProvider>
    </MemoryRouter>
  );

  return {
    ...result,
    getSession: () => capturedSession!,
    getLocation: () => capturedLocation!,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HomeScreen', () => {
  it('renders exactly 7 weather cards', () => {
    renderHomeScreen();

    const weatherNames = [
      'Sunny', 'Rainy', 'Stormy', 'Foggy', 'Windy', 'Sparkly', 'Heavy Clouds',
    ];

    const cards = weatherNames.map((name) => screen.getByRole('button', { name }));
    expect(cards).toHaveLength(7);
  });

  it('tapping a weather card sets weatherMetaphor in session state', async () => {
    const user = userEvent.setup();
    const { getSession } = renderHomeScreen();

    expect(getSession().sessionState.weatherMetaphor).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Sunny' }));

    expect(getSession().sessionState.weatherMetaphor).toBe('sunny');
  });

  it('tapping a weather card navigates away from home', async () => {
    const user = userEvent.setup();
    const { getLocation } = renderHomeScreen();

    expect(getLocation().pathname).toBe('/');

    await user.click(screen.getByRole('button', { name: 'Sunny' }));

    expect(getLocation().pathname).toBe('/body-map');
  });
});
