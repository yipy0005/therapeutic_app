/**
 * Unit tests for CalmToolbox and CalmToolActivity
 * Validates: Requirements 5.5, 5.8
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { CalmToolbox } from '../screens/CalmToolbox';
import { CalmToolActivity } from '../screens/CalmToolActivity';
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
    weatherMetaphor: 'sunny',
    bodyRegions: ['chest'],
    intensityLevel: 3,
    selectedEmotion: 'Happy',
    calmToolsUsed: [],
    reflectionResponses: {},
    nextStep: null,
    currentStep: 'calm-toolbox',
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

/** Renders CalmToolbox with routing context */
function renderCalmToolbox() {
  return render(
    <MemoryRouter initialEntries={['/calm-toolbox']}>
      <AppProvider>
        <Routes>
          <Route path="/calm-toolbox" element={<CalmToolbox />} />
          <Route path="/calm-activity/:toolId" element={<CalmToolActivity />} />
          <Route path="/reflection" element={<div>Reflection</div>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

/** Renders CalmToolActivity for a given toolId */
function renderCalmToolActivity(toolId: string) {
  return render(
    <MemoryRouter initialEntries={[`/calm-activity/${toolId}`]}>
      <AppProvider>
        <Routes>
          <Route path="/calm-toolbox" element={<CalmToolbox />} />
          <Route path="/calm-activity/:toolId" element={<CalmToolActivity />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// CalmToolbox tests
// ---------------------------------------------------------------------------

describe('CalmToolbox', () => {
  it('"I feel better" button is disabled when no tools have been used', () => {
    seedSession({ calmToolsUsed: [] });
    renderCalmToolbox();

    const feelBetterBtn = screen.getByRole('button', { name: /I feel better/i });
    expect(feelBetterBtn).toBeDisabled();
  });

  it('"I feel better" button is enabled once at least one tool has been used', () => {
    seedSession({ calmToolsUsed: ['smell-flower'] });
    renderCalmToolbox();

    const feelBetterBtn = screen.getByRole('button', { name: /I feel better/i });
    expect(feelBetterBtn).not.toBeDisabled();
  });

  it('renders at least 5 calm tool cards', () => {
    seedSession();
    renderCalmToolbox();

    // Each tool card has an aria-label matching the tool label
    const toolCards = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label') !== 'I feel better 🌈' &&
               btn.getAttribute('aria-label') !== null &&
               btn.getAttribute('aria-label') !== ''
    );
    expect(toolCards.length).toBeGreaterThanOrEqual(5);
  });

  it('displays the "Pick a power" prompt', () => {
    seedSession();
    renderCalmToolbox();
    expect(screen.getByText(/Pick a power/i)).toBeInTheDocument();
  });

  it('tapping a tool card navigates to the calm activity screen', async () => {
    const user = userEvent.setup();
    seedSession();
    renderCalmToolbox();

    const smellFlowerCard = screen.getByRole('button', { name: /Smell the Flower/i });
    await user.click(smellFlowerCard);

    // Should now show the activity screen for smell-flower
    expect(screen.getByText(/Smell the Flower/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Done/i })).toBeInTheDocument();
  });

  it('already-used tools show a "Done!" badge', () => {
    seedSession({ calmToolsUsed: ['smell-flower'] });
    renderCalmToolbox();
    expect(screen.getByText('✓ Done!')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// CalmToolActivity tests
// ---------------------------------------------------------------------------

describe('CalmToolActivity', () => {
  it('renders the tool title and instruction', () => {
    seedSession();
    renderCalmToolActivity('smell-flower');

    expect(screen.getByText(/Smell the Flower/i)).toBeInTheDocument();
    expect(screen.getByText(/breathe in slowly/i)).toBeInTheDocument();
  });

  it('renders a breathing guide for breathing tools', () => {
    seedSession();
    renderCalmToolActivity('smell-flower');

    expect(screen.getByLabelText(/Breathing guide animation/i)).toBeInTheDocument();
  });

  it('does not render a breathing guide for non-breathing tools', () => {
    seedSession();
    renderCalmToolActivity('push-wall');

    expect(screen.queryByLabelText(/Breathing guide animation/i)).not.toBeInTheDocument();
  });

  it('clicking "Done" returns to the calm toolbox', async () => {
    const user = userEvent.setup();
    seedSession();
    renderCalmToolActivity('smell-flower');

    const doneBtn = screen.getByRole('button', { name: /Mark activity as done/i });
    await user.click(doneBtn);

    // After clicking Done, should navigate back to CalmToolbox
    expect(screen.getByText(/Pick a power/i)).toBeInTheDocument();
  });

  it('clicking "Done" marks the tool as used (shows Done badge on toolbox)', async () => {
    const user = userEvent.setup();
    seedSession({ calmToolsUsed: [] });
    renderCalmToolActivity('smell-flower');

    await user.click(screen.getByRole('button', { name: /Mark activity as done/i }));

    // Back on toolbox — smell-flower should now show the used badge
    expect(screen.getByText('✓ Done!')).toBeInTheDocument();
  });

  it('shows "Activity not found" for an unknown toolId', () => {
    seedSession();
    renderCalmToolActivity('nonexistent-tool');

    expect(screen.getByText(/Activity not found/i)).toBeInTheDocument();
  });

  it('"Back" button returns to the calm toolbox without marking tool as used', async () => {
    const user = userEvent.setup();
    seedSession({ calmToolsUsed: [] });
    renderCalmToolActivity('smell-flower');

    await user.click(screen.getByRole('button', { name: /Back to calm toolbox/i }));

    // Back on toolbox — "I feel better" should still be disabled (no tool used)
    expect(screen.getByRole('button', { name: /I feel better/i })).toBeDisabled();
  });
});
