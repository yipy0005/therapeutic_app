/**
 * Unit tests for IntensityScale
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { IntensityScale, shouldShowIntensityGuidance } from '../screens/IntensityScale';
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
// Helper
// ---------------------------------------------------------------------------
function renderIntensityScale() {
  return render(
    <MemoryRouter initialEntries={['/intensity']}>
      <AppProvider>
        <IntensityScale />
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('IntensityScale', () => {
  it('renders 5 selectable levels', () => {
    renderIntensityScale();
    for (let level = 1; level <= 5; level++) {
      expect(screen.getByRole('button', { name: new RegExp(`Level ${level}`) })).toBeInTheDocument();
    }
  });

  it('displays correct labels for each level', () => {
    renderIntensityScale();
    expect(screen.getByText('Tiny feeling')).toBeInTheDocument();
    expect(screen.getByText('Growing feeling')).toBeInTheDocument();
    expect(screen.getByText('Big feeling')).toBeInTheDocument();
    expect(screen.getByText('Too big')).toBeInTheDocument();
    expect(screen.getByText('Eruption')).toBeInTheDocument();
  });

  it('Next button is disabled until a level is selected', async () => {
    renderIntensityScale();
    const nextButton = screen.getByRole('button', { name: 'Next →' });
    expect(nextButton).toBeDisabled();
  });

  it('highlights selected level with aria-pressed', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    const level3 = screen.getByRole('button', { name: /Level 3/ });
    expect(level3).toHaveAttribute('aria-pressed', 'false');

    await user.click(level3);
    expect(level3).toHaveAttribute('aria-pressed', 'true');
  });

  it('Next button becomes enabled after selecting a level', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    await user.click(screen.getByRole('button', { name: /Level 2/ }));
    expect(screen.getByRole('button', { name: 'Next →' })).not.toBeDisabled();
  });

  it('does NOT show guidance message for levels 1–3', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    for (const level of [1, 2, 3]) {
      await user.click(screen.getByRole('button', { name: new RegExp(`Level ${level}`) }));
      expect(screen.queryByText(/That means we don't need to solve the problem yet/)).not.toBeInTheDocument();
    }
  });

  it('shows guidance message when level 4 is selected', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    await user.click(screen.getByRole('button', { name: /Level 4/ }));
    expect(screen.getByText(/Your feeling is a 4/)).toBeInTheDocument();
    expect(screen.getByText(/we don't need to solve the problem yet/)).toBeInTheDocument();
  });

  it('shows guidance message when level 5 is selected', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    await user.click(screen.getByRole('button', { name: /Level 5/ }));
    expect(screen.getByText(/Your feeling is a 5/)).toBeInTheDocument();
  });

  it('shows parent-script-panel placeholder when level >= 4', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    expect(screen.queryByTestId('parent-script-panel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Level 4/ }));
    expect(screen.getByTestId('parent-script-panel')).toBeInTheDocument();
  });

  it('hides parent-script-panel for levels < 4', async () => {
    const user = userEvent.setup();
    renderIntensityScale();

    await user.click(screen.getByRole('button', { name: /Level 3/ }));
    expect(screen.queryByTestId('parent-script-panel')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Pure function tests
// ---------------------------------------------------------------------------

describe('shouldShowIntensityGuidance', () => {
  it('returns false for levels 1, 2, 3', () => {
    expect(shouldShowIntensityGuidance(1)).toBe(false);
    expect(shouldShowIntensityGuidance(2)).toBe(false);
    expect(shouldShowIntensityGuidance(3)).toBe(false);
  });

  it('returns true for levels 4 and 5', () => {
    expect(shouldShowIntensityGuidance(4)).toBe(true);
    expect(shouldShowIntensityGuidance(5)).toBe(true);
  });
});
