/**
 * Unit tests for ProblemSolving screen
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { ProblemSolving } from '../screens/ProblemSolving';
import { saveData, _resetFallbackState } from '../storage/adapter';
import type { SessionState } from '../types';

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
// Helpers
// ---------------------------------------------------------------------------

function baseSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    weatherMetaphor: 'stormy',
    bodyRegions: ['chest'],
    intensityLevel: 3,
    selectedEmotion: 'Angry',
    calmToolsUsed: ['smell-flower'],
    reflectionResponses: {},
    nextStep: null,
    currentStep: 'problem-solving',
    ...overrides,
  };
}

function seedSession(overrides: Partial<SessionState> = {}) {
  saveData({
    version: 1,
    currentSession: baseSession(overrides),
    badgeCollection: [],
  });
}

function renderProblemSolving() {
  return render(
    <MemoryRouter initialEntries={['/problem-solving']}>
      <AppProvider>
        <Routes>
          <Route path="/problem-solving" element={<ProblemSolving />} />
          <Route path="/badge-screen" element={<div>BadgeScreen</div>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProblemSolving', () => {
  it('renders at least 8 next-step tiles (Req 8.1)', () => {
    seedSession();
    renderProblemSolving();

    const tiles = screen.getAllByRole('button', { name: /.+/ }).filter(
      (btn) => btn.hasAttribute('aria-pressed')
    );
    expect(tiles.length).toBeGreaterThanOrEqual(8);
  });

  it('includes all required next-step options (Req 8.2)', () => {
    seedSession();
    renderProblemSolving();

    const requiredLabels = [
      'Ask for Help',
      'Use Words',
      'Take a Break',
      'Try Again',
      'Make a Plan',
      'Repair / Say Sorry',
      'Ask for a Turn',
      'Tell the Truth',
      'Let It Go',
    ];

    for (const label of requiredLabels) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('"Repair / Say Sorry" is NOT the first tile (Req 8.3)', () => {
    seedSession();
    renderProblemSolving();

    const tiles = screen.getAllByRole('button').filter(
      (btn) => btn.hasAttribute('aria-pressed')
    );
    expect(tiles[0]).not.toHaveAccessibleName('Repair / Say Sorry');
  });

  it('Done button is disabled before any tile is selected (Req 8.4)', () => {
    seedSession();
    renderProblemSolving();

    const doneBtn = screen.getByRole('button', { name: /done/i });
    expect(doneBtn).toBeDisabled();
  });

  it('selecting a tile enables the Done button (Req 8.4)', async () => {
    const user = userEvent.setup();
    seedSession();
    renderProblemSolving();

    await user.click(screen.getByRole('button', { name: 'Ask for Help' }));

    const doneBtn = screen.getByRole('button', { name: /done/i });
    expect(doneBtn).not.toBeDisabled();
  });

  it('shows an encouraging message after selecting a tile (Req 8.5)', async () => {
    const user = userEvent.setup();
    seedSession();
    renderProblemSolving();

    // No message before selection
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ask for Help' }));

    const msg = screen.getByRole('status');
    expect(msg).toBeInTheDocument();
    expect(msg.textContent?.length).toBeGreaterThan(0);
  });

  it('only one tile can be selected at a time (single-select, Req 8.6)', async () => {
    const user = userEvent.setup();
    seedSession();
    renderProblemSolving();

    await user.click(screen.getByRole('button', { name: 'Ask for Help' }));
    await user.click(screen.getByRole('button', { name: 'Use Words' }));

    const askForHelp = screen.getByRole('button', { name: 'Ask for Help' });
    const useWords = screen.getByRole('button', { name: 'Use Words' });

    expect(askForHelp).toHaveAttribute('aria-pressed', 'false');
    expect(useWords).toHaveAttribute('aria-pressed', 'true');
  });

  it('Done navigates to /badge-screen (Req 8.7)', async () => {
    const user = userEvent.setup();
    seedSession();
    renderProblemSolving();

    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    await user.click(screen.getByRole('button', { name: /done/i }));

    expect(screen.getByText('BadgeScreen')).toBeInTheDocument();
  });
});
