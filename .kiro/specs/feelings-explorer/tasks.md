# Implementation Plan: Feelings Explorer

## Overview

Build a parent-child co-regulation SPA using React 18 + Vite, CSS Modules, React Context + localStorage, and React Router v6 (hash-based). The implementation follows the enforced session flow: Home → Body Map → Intensity → Name It → Calm Toolbox → Reflection → Problem-Solving → Badge Screen. Tasks are ordered so each step integrates into the running app before the next begins.

## Tasks

- [x] 1. Project scaffold and static data
  - Initialise Vite + React 18 + TypeScript project
  - Install dependencies: react-router-dom v6, vitest, @vitest/coverage-v8, fast-check, @testing-library/react, @testing-library/user-event
  - Create CSS custom properties file (`src/styles/tokens.css`) with pastel palette, border-radius, and spacing scale
  - Define all TypeScript types and interfaces from the design (`src/types/index.ts`): `SessionState`, `BadgeState`, `WeatherMetaphor`, `BodyRegion`, `SessionStep`, `BadgeType`, `CalmTool`, `EmotionWord`, `StoredData`, `EveningCheckInRecord`
  - Create static data module (`src/data/index.ts`) with `WEATHER_EMOTION_MAP`, `PARENT_SCRIPTS`, `DEFAULT_PARENT_SCRIPT`, `INTENSITY_LABELS`, `CALM_TOOLS`, `BADGE_CONDITIONS`, `STEP_ORDER`, `ALL_WEATHER_METAPHORS`, `ALL_BADGE_TYPES`
  - _Requirements: 1.4, 3.3, 4.2, 5.1, 6.2, 9.2_

- [x] 2. localStorage adapter and session context
  - [x] 2.1 Implement localStorage adapter (`src/storage/adapter.ts`)
    - Wrap all reads/writes in try/catch; fall back to in-memory on failure
    - Implement `loadData()`, `saveData()`, `clearData()` against the `StoredData` schema
    - Validate schema version on load; reset to clean state if invalid
    - _Requirements: 13.1, 13.2, 13.6_

  - [x] 2.2 Write property test for localStorage round-trip
    - **Property 4: Session state round-trips through JSON serialisation**
    - **Validates: Requirements 13.1, 14.5**

  - [x] 2.3 Implement `SessionContext` and `BadgeContext` (`src/context/`)
    - Provide `sessionState`, `dispatch`, `badgeState`, `badgeDispatch` via React Context
    - Persist to localStorage on every state change
    - Expose `resetSession()` and `clearAllData()` actions
    - _Requirements: 13.1, 13.4, 13.5_

  - [x] 2.4 Write unit tests for context providers
    - Test that state updates propagate to consumers
    - Test that `clearAllData()` resets both contexts and localStorage
    - _Requirements: 13.4, 13.5_

- [x] 3. App shell: routing, layout, and error boundaries
  - Set up `HashRouter` with routes for all screens in `src/App.tsx`
  - Create `AppProvider` wrapping `SessionContext` + `BadgeContext`
  - Implement `SessionFlow` route guard (`src/components/SessionFlow.tsx`) using `isStepUnlocked()` — redirect to earliest unlocked step on invalid navigation
  - Add `isStepUnlocked()` pure function (`src/utils/sessionGuard.ts`) matching the design spec
  - Add a non-blocking storage-unavailable banner component
  - _Requirements: 14.1, 14.2, 14.3, 13.6_

  - [x] 3.1 Write property test for session step unlock monotonicity
    - **Property 2: Step unlock is monotone — enriching state never locks a previously unlocked step**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 4. Home Screen
  - [x] 4.1 Implement `HomeScreen` component (`src/screens/HomeScreen.tsx`)
    - Render exactly 7 `WeatherCard` tiles in a responsive grid
    - Display "How is your weather today?" prompt (readable at 375px)
    - On weather tap: set `weatherMetaphor` in session state and navigate to `/body-map`
    - Render `EveningCheckInButton`, `BadgeCollectionButton`, `ForGrownUpsButton`
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

  - [x] 4.2 Write unit tests for HomeScreen
    - Assert exactly 7 weather cards are rendered
    - Assert tapping a card sets state and navigates
    - _Requirements: 1.1, 1.3_

- [x] 5. Body Map screen
  - [x] 5.1 Implement `BodyMap` component (`src/screens/BodyMap.tsx`)
    - Render SVG body silhouette with 6 tappable regions: head, throat, chest, tummy, hands, legs
    - Toggle highlight on tap; allow multi-select; deselect on second tap
    - Display "Where do you feel it in your body?" prompt
    - Enable "Next" button only when ≥1 region selected; navigate to `/intensity`
    - Persist selected regions to session state
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 5.2 Write unit tests for BodyMap
    - Test region toggle on/off
    - Test Next button disabled until ≥1 region selected
    - _Requirements: 2.3, 2.5, 2.7_

- [x] 6. Intensity Scale screen
  - [x] 6.1 Implement `IntensityScale` component (`src/screens/IntensityScale.tsx`)
    - Render 5 selectable levels with volcano/thermometer visual metaphor and `INTENSITY_LABELS`
    - Highlight selected level; enable "Next" once a level is chosen
    - Show guidance message when level ≥ 4: "Your feeling is a [level]. That means we don't need to solve the problem yet. First, we help your body feel safe."
    - Show `ParentScriptPanel` with weather-mapped script when level ≥ 4
    - Persist intensity level to session state; navigate to `/name-it`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 6.2 Write property test for intensity guidance visibility
    - **Property 5: Intensity guidance shown if and only if level ≥ 4**
    - **Validates: Requirements 3.5, 3.6**

  - [x] 6.3 Write unit tests for IntensityScale
    - Test guidance message appears at levels 4 and 5, absent at 1–3
    - Test ParentScriptPanel visibility at level 4/5
    - _Requirements: 3.5, 3.6_

- [x] 7. ParentScriptPanel component
  - Implement `ParentScriptPanel` (`src/components/ParentScriptPanel.tsx`)
  - Visually distinct: amber/cream background, "For Grown-Ups 👋" label, smaller font
  - Accept `weather` prop; display `PARENT_SCRIPTS[weather]` or `DEFAULT_PARENT_SCRIPT` when no trigger is active
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.1 Write property test for parent script completeness
    - **Property 8: Parent script is a non-empty string for every WeatherMetaphor**
    - **Validates: Requirements 6.1, 6.2**

- [x] 8. Name It screen
  - [x] 8.1 Implement `NameIt` component (`src/screens/NameIt.tsx`)
    - Filter `WEATHER_EMOTION_MAP[weather]` to render emotion word cards for the selected family
    - Each card: large tappable tile with label + emoji; single-select
    - Show `ParentScriptPanel` with interpolated prompt: "I wonder if you're feeling [emotion] because… Did I get that right?"
    - "No, it's more like…" button clears selection
    - Enable "Next" once a card is selected; persist to session state; navigate to `/calm-toolbox`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

  - [x] 8.2 Write property test for weather-to-emotion-family mapping
    - **Property 1: WEATHER_EMOTION_MAP is total — every WeatherMetaphor maps to a non-empty array of non-empty strings**
    - **Validates: Requirements 1.4, 4.2**

  - [x] 8.3 Write unit tests for NameIt
    - Test "No, it's more like…" clears selection
    - Test Next button disabled until a card is selected
    - _Requirements: 4.5, 4.7, 4.8_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Calm Toolbox and activity screens
  - [x] 10.1 Implement `CalmToolbox` component (`src/screens/CalmToolbox.tsx`)
    - Display ≥5 `CalmToolCard` tiles across breathing, body, sensory, and connection categories
    - "Pick a power" prompt; tapping a card navigates to `/calm-activity/:toolId`
    - "I feel better" button enabled once ≥1 tool used; navigates to `/reflection`
    - Persist `calmToolsUsed` list to session state (append-only)
    - _Requirements: 5.1, 5.2, 5.6, 5.7, 5.8, 5.9_

  - [x] 10.2 Write property test for calm tool list append-only invariant
    - **Property 6: Using a calm tool only grows the calmToolsUsed list — no previously used tool is removed**
    - **Validates: Requirements 5.7, 5.9**

  - [x] 10.3 Implement `CalmToolActivity` component (`src/screens/CalmToolActivity.tsx`)
    - Full-screen guided activity view with step-by-step animated instructions
    - For breathing tools: render `BreathingGuide` (expanding/contracting CSS shape)
    - "Done" button marks tool as used, returns to `/calm-toolbox`
    - _Requirements: 5.3, 5.4, 5.5_

  - [x] 10.4 Write unit tests for CalmToolbox and CalmToolActivity
    - Test "I feel better" disabled until ≥1 tool used
    - Test completing an activity returns to toolbox
    - _Requirements: 5.5, 5.8_

- [x] 11. Reflection screen
  - [x] 11.1 Implement `Reflection` component (`src/screens/Reflection.tsx`)
    - Present 4 prompts sequentially: "What happened?", "What did you feel?", "What did your body want to do?", "What can we try next time?"
    - Each prompt: icon/sticker response options (no free-text input), multi-select allowed
    - "Skip" button on each prompt; "Next" advances to next prompt
    - After all 4 prompts answered/skipped, navigate to `/problem-solving`
    - Persist responses to session state
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [x] 11.2 Write unit tests for Reflection
    - Test Skip advances to next prompt without requiring a selection
    - Test all 4 prompts complete → navigates to problem-solving
    - _Requirements: 7.5, 7.7_

- [x] 12. Problem-Solving screen
  - [x] 12.1 Implement `ProblemSolving` component (`src/screens/ProblemSolving.tsx`)
    - Display ≥8 next-step tiles: Ask for Help, Use Words, Take a Break, Try Again, Make a Plan, Repair / Say Sorry, Ask for a Turn, Tell the Truth, Let It Go
    - "Repair / Say Sorry" must not be first or only highlighted option
    - Single-select; show brief encouraging message on selection
    - "Done" button enabled after selection; navigates to `/badge-screen`
    - Persist selected next step to session state
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [x] 12.2 Write unit tests for ProblemSolving
    - Test "Repair / Say Sorry" is not the first tile
    - Test Done button disabled until a tile is selected
    - _Requirements: 8.3, 8.6_

- [x] 13. Badge evaluation and Badge Screen
  - [x] 13.1 Implement `evaluateBadges()` utility (`src/utils/badges.ts`)
    - Apply all `BADGE_CONDITIONS` against the completed session state
    - Return deterministic array of earned `BadgeType` values
    - Merge newly earned badges into `BadgeState` (no duplicates)
    - _Requirements: 9.1, 9.2, 9.3_

  - [x] 13.2 Write property test for badge evaluation determinism
    - **Property 3: Evaluating badges twice on the same session state yields identical results**
    - **Validates: Requirements 9.1, 9.2**

  - [x] 13.3 Implement `BadgeScreen` component (`src/screens/BadgeScreen.tsx`)
    - Display badge award animation for each newly earned badge
    - "Home" button resets session state and navigates to `/`
    - _Requirements: 9.3_

  - [x] 13.4 Write unit tests for badge earning
    - Test each badge condition independently with a crafted session state
    - _Requirements: 9.1, 9.2_

- [x] 14. Badge Collection view
  - Implement `BadgeCollection` component (`src/screens/BadgeCollection.tsx`)
  - Display all previously earned badges as `BadgeTile` components
  - Accessible from Home Screen; no competitive rankings or leaderboards
  - _Requirements: 9.4, 9.5, 9.6, 9.7_

  - [x] 14.1 Write property test for badge persistence across sessions
    - **Property 7: Badges earned in one session are still present after saving and reloading from localStorage**
    - **Validates: Requirements 9.4, 9.5**

- [x] 15. Evening Check-In flow
  - Implement `EveningCheckIn` component (`src/screens/EveningCheckIn.tsx`)
  - 4 sequential icon-driven prompts: "What was one feeling you had today?", "How big was it?", "What helped?", "What are you proud of?"
  - No free-text input; Skip allowed on each prompt
  - Closing message on completion; return to Home Screen
  - Persist responses to `eveningCheckIns` in localStorage
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 16. Parent Safety Section
  - Implement `ParentSafetySection` with `AdultConfirmGate` (`src/screens/ParentSafetySection.tsx`)
  - Gate requires parent to confirm they are the adult before showing content
  - Display guidance for ≥3 escalation scenarios (paediatrician, school counsellor, child psychologist)
  - Plain language, no clinical jargon; disclaimer that app is not a substitute for professional support
  - No login or account required
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 17. Session progress indicator and Back navigation
  - Implement `ProgressIndicator` component (step dots) shown on every session screen
  - Implement `BackButton` on every session screen except Home Screen
  - On back navigation, restore previous screen's selections from session state in context
  - _Requirements: 14.4, 14.5, 14.6_

- [x] 18. Voice narration (Web Speech API)
  - Add `useNarration` hook (`src/hooks/useNarration.ts`) wrapping `window.speechSynthesis`
  - Render speaker icon on each child-facing screen; tap to read prompt aloud
  - Hide speaker icon gracefully when `speechSynthesis` is unavailable (no error shown)
  - _Requirements: 12.4_

  - [x] 18.1 Write unit test for narration unavailability
    - Test that speaker icon is absent when `window.speechSynthesis` is undefined
    - _Requirements: 12.4_

- [x] 19. Settings: Clear All Data
  - Add "Clear All Data" option in the Parent/Settings area
  - Two-step confirmation: first tap shows dialog; confirm deletes all localStorage and navigates to Home; cancel dismisses
  - _Requirements: 13.4, 13.5_

  - [x] 19.1 Write unit test for Clear All Data two-step confirmation
    - Test cancel leaves data intact; test confirm deletes data and navigates home
    - _Requirements: 13.4, 13.5_

- [x] 20. Responsive layout and accessibility polish
  - Verify all interactive elements meet 44×44px minimum touch target size
  - Verify no horizontal scroll at 375px, 768px, and 1280px viewports
  - Add `axe-core` accessibility checks in Vitest for colour contrast (≥4.5:1 for body text)
  - Ensure no free-text keyboard input is required anywhere in the session or evening check-in
  - _Requirements: 12.1, 12.2, 12.5, 12.6_

- [x] 21. Error handling: corrupted localStorage and storage unavailable
  - Verify storage adapter resets to clean state on invalid JSON (log warning, show one-time notice)
  - Verify in-memory fallback session works end-to-end when localStorage throws
  - Verify non-blocking banner appears when storage is unavailable
  - _Requirements: 13.1, 13.6_

  - [x] 21.1 Write unit tests for storage error handling
    - Test corrupted JSON → clean state, no crash
    - Test storage unavailable → in-memory session completes without error
    - _Requirements: 13.1, 13.6_

- [x] 22. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations per property
- Unit tests use Vitest + @testing-library/react
- All property tests must include the tag comment: `// Feature: feelings-explorer, Property N: <property text>`
- Checkpoints at tasks 9 and 22 ensure incremental validation before proceeding
