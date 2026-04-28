/**
 * Unit tests for Reflection
 * Validates: Requirements 7.5, 7.7
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { Reflection } from '../screens/Reflection';
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
    selectedEmotions: ['Angry'],
    calmToolsUsed: ['smell-flower'],
    reflectionResponses: {},
    nextStep: null,
    currentStep: 'reflection',
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

function renderReflection() {
  return render(
    <MemoryRouter initialEntries={['/reflection']}>
      <AppProvider>
        <Routes>
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/problem-solving" element={<div>ProblemSolving</div>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Reflection', () => {
  it('renders the first prompt on mount', () => {
    seedSession();
    renderReflection();

    expect(screen.getByText('What happened?')).toBeInTheDocument();
    expect(screen.getByText('1 of 4')).toBeInTheDocument();
  });

  it('Skip advances to the next prompt without requiring a selection', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    // On prompt 1 — skip without selecting anything
    await user.click(screen.getByRole('button', { name: /skip/i }));

    // Should now show prompt 2
    expect(screen.getByText('What did you feel?')).toBeInTheDocument();
    expect(screen.getByText('2 of 4')).toBeInTheDocument();
  });

  it('Next advances to the next prompt', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('What did you feel?')).toBeInTheDocument();
  });

  it('can select an option and advance with Next', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    const option = screen.getByRole('button', { name: 'We argued' });
    await user.click(option);
    expect(option).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(screen.getByText('What did you feel?')).toBeInTheDocument();
  });

  it('selections are cleared when advancing to the next prompt', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    // Select on prompt 1
    await user.click(screen.getByRole('button', { name: 'We argued' }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // On prompt 2 — none of prompt 2's options should be selected
    const angryOption = screen.getByRole('button', { name: 'Angry' });
    expect(angryOption).toHaveAttribute('aria-pressed', 'false');
  });

  it('allows multi-select on a single prompt', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    await user.click(screen.getByRole('button', { name: 'We argued' }));
    await user.click(screen.getByRole('button', { name: 'I got hurt' }));

    expect(screen.getByRole('button', { name: 'We argued' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'I got hurt' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('tapping a selected option deselects it', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    const option = screen.getByRole('button', { name: 'We argued' });
    await user.click(option);
    expect(option).toHaveAttribute('aria-pressed', 'true');

    await user.click(option);
    expect(option).toHaveAttribute('aria-pressed', 'false');
  });

  it('skipping all 4 prompts navigates to /problem-solving', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: /skip/i }));
    }

    expect(screen.getByText('ProblemSolving')).toBeInTheDocument();
  });

  it('completing all 4 prompts with Next navigates to /problem-solving', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    // Prompts 1–3: click Next
    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    // Prompt 4: button label changes to "Done ✓"
    expect(screen.getByText('What can we try next time?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /done/i }));

    expect(screen.getByText('ProblemSolving')).toBeInTheDocument();
  });

  it('shows "Done ✓" button label on the last prompt', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    for (let i = 0; i < 3; i++) {
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });

  it('mixing Skip and Next across all 4 prompts navigates to /problem-solving', async () => {
    const user = userEvent.setup();
    seedSession();
    renderReflection();

    await user.click(screen.getByRole('button', { name: /next/i }));   // prompt 1 → 2
    await user.click(screen.getByRole('button', { name: /skip/i }));   // prompt 2 → 3
    await user.click(screen.getByRole('button', { name: /next/i }));   // prompt 3 → 4
    await user.click(screen.getByRole('button', { name: /done/i }));   // prompt 4 → navigate

    expect(screen.getByText('ProblemSolving')).toBeInTheDocument();
  });
});
