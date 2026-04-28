/**
 * Unit tests for NameIt
 * Validates: Requirements 4.5, 4.7, 4.8
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { NameIt } from '../screens/NameIt';
import { saveData, _resetFallbackState } from '../storage/adapter';

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
// Helper: pre-seed session state with weatherMetaphor: 'sunny'
// ---------------------------------------------------------------------------
function seedSunnySession() {
  saveData({
    version: 1,
    currentSession: {
      weatherMetaphor: 'sunny',
      bodyRegions: [],
      intensityLevel: null,
      selectedEmotion: null,
      calmToolsUsed: [],
      reflectionResponses: {},
      nextStep: null,
      currentStep: 'name-it',
    },
    badgeCollection: [],
    eveningCheckIns: [],
  });
}

// ---------------------------------------------------------------------------
// Helper: renders NameIt with required providers
// ---------------------------------------------------------------------------
function renderNameIt() {
  return render(
    <MemoryRouter initialEntries={['/name-it']}>
      <AppProvider>
        <NameIt />
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NameIt', () => {
  it('"No, it\'s more like…" clears the selected emotion card', async () => {
    const user = userEvent.setup();
    seedSunnySession();
    renderNameIt();

    const happyCard = screen.getByRole('button', { name: 'Happy' });

    // Click to select Happy
    await user.click(happyCard);
    expect(happyCard).toHaveAttribute('aria-pressed', 'true');

    // Click "No, it's more like…" to clear
    const clearButton = screen.getByRole('button', { name: /no, it's more like/i });
    await user.click(clearButton);

    // Happy should no longer be selected
    expect(happyCard).toHaveAttribute('aria-pressed', 'false');
  });

  it('Next button is disabled until an emotion card is selected', async () => {
    const user = userEvent.setup();
    seedSunnySession();
    renderNameIt();

    const nextButton = screen.getByRole('button', { name: 'Next →' });

    // Disabled initially
    expect(nextButton).toBeDisabled();

    // Select Happy
    await user.click(screen.getByRole('button', { name: 'Happy' }));

    // Now enabled
    expect(nextButton).not.toBeDisabled();
  });
});
