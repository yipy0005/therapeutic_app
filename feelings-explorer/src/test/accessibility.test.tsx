/**
 * Accessibility tests using axe-core
 * Validates: Requirements 12.1, 12.2, 12.5, 12.6
 *
 * Checks all session screens for axe-core violations (structural accessibility:
 * roles, labels, keyboard navigation). Colour contrast checks require a real
 * browser and are not reliable in jsdom.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { AppProvider } from '../context/AppProvider';
import { HomeScreen } from '../screens/HomeScreen';
import { BodyMap } from '../screens/BodyMap';
import { IntensityScale } from '../screens/IntensityScale';
import { NameIt } from '../screens/NameIt';
import { CalmToolbox } from '../screens/CalmToolbox';
import { Reflection } from '../screens/Reflection';
import { ProblemSolving } from '../screens/ProblemSolving';
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
// Helper: render a screen and run axe
// ---------------------------------------------------------------------------
async function runAxe(ui: React.ReactElement, route = '/') {
  const { container } = render(
    <MemoryRouter initialEntries={[route]}>
      <AppProvider>
        {ui}
      </AppProvider>
    </MemoryRouter>
  );

  // Disable colour-contrast rule — jsdom cannot compute computed styles
  // accurately enough for contrast checks; those require a real browser.
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  });

  return results;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Accessibility — axe-core checks', () => {
  it('HomeScreen has no axe violations', async () => {
    const results = await runAxe(<HomeScreen />, '/');
    expect(results.violations).toHaveLength(0);
  });

  it('BodyMap has no axe violations', async () => {
    const results = await runAxe(<BodyMap />, '/body-map');
    expect(results.violations).toHaveLength(0);
  });

  it('IntensityScale has no axe violations', async () => {
    const results = await runAxe(<IntensityScale />, '/intensity');
    expect(results.violations).toHaveLength(0);
  });

  it('NameIt has no axe violations', async () => {
    const results = await runAxe(<NameIt />, '/name-it');
    expect(results.violations).toHaveLength(0);
  });

  it('CalmToolbox has no axe violations', async () => {
    const results = await runAxe(<CalmToolbox />, '/calm-toolbox');
    expect(results.violations).toHaveLength(0);
  });

  it('Reflection has no axe violations', async () => {
    const results = await runAxe(<Reflection />, '/reflection');
    expect(results.violations).toHaveLength(0);
  });

  it('ProblemSolving has no axe violations', async () => {
    const results = await runAxe(<ProblemSolving />, '/problem-solving');
    expect(results.violations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Requirement 12.5 — no free-text keyboard input in any session screen
// ---------------------------------------------------------------------------
describe('No free-text input (Requirement 12.5)', () => {
  const screens: Array<{ name: string; element: React.ReactElement; route: string }> = [
    { name: 'HomeScreen',     element: <HomeScreen />,     route: '/' },
    { name: 'BodyMap',        element: <BodyMap />,        route: '/body-map' },
    { name: 'IntensityScale', element: <IntensityScale />, route: '/intensity' },
    { name: 'NameIt',         element: <NameIt />,         route: '/name-it' },
    { name: 'CalmToolbox',    element: <CalmToolbox />,    route: '/calm-toolbox' },
    { name: 'Reflection',     element: <Reflection />,     route: '/reflection' },
    { name: 'ProblemSolving', element: <ProblemSolving />, route: '/problem-solving' },
  ];

  screens.forEach(({ name, element, route }) => {
    it(`${name} contains no text inputs or textareas`, () => {
      const { container } = render(
        <MemoryRouter initialEntries={[route]}>
          <AppProvider>
            {element}
          </AppProvider>
        </MemoryRouter>
      );

      const textInputs = container.querySelectorAll(
        'input[type="text"], input[type="search"], input[type="email"], textarea, [contenteditable="true"]'
      );
      expect(textInputs).toHaveLength(0);
    });
  });
});
