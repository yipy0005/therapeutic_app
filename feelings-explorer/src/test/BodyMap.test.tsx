/**
 * Unit tests for BodyMap
 * Validates: Requirements 2.3, 2.5, 2.7
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '../context/AppProvider';
import { BodyMap } from '../screens/BodyMap';
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
// Helper: renders BodyMap with required providers
// ---------------------------------------------------------------------------
function renderBodyMap() {
  return render(
    <MemoryRouter initialEntries={['/body-map']}>
      <AppProvider>
        <BodyMap />
      </AppProvider>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BodyMap', () => {
  it('toggles a region on and off', async () => {
    const user = userEvent.setup();
    renderBodyMap();

    const headButton = screen.getByRole('button', { name: 'Head' });

    // Initially not selected
    expect(headButton).toHaveAttribute('aria-pressed', 'false');

    // Click to select
    await user.click(headButton);
    expect(headButton).toHaveAttribute('aria-pressed', 'true');

    // Click again to deselect
    await user.click(headButton);
    expect(headButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('Next button is disabled until at least one region is selected', async () => {
    const user = userEvent.setup();
    renderBodyMap();

    const nextButton = screen.getByRole('button', { name: 'Next →' });

    // Disabled initially
    expect(nextButton).toBeDisabled();

    // Select a region
    await user.click(screen.getByRole('button', { name: 'Chest' }));

    // Now enabled
    expect(nextButton).not.toBeDisabled();
  });
});
