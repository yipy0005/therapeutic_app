# Requirements Document

## Introduction

Feelings Explorer is a parent-child co-regulation web app designed for a parent and a child aged approximately 5–10 years to use together in sessions of 5–10 minutes. The app guides the pair through a structured emotional literacy journey: noticing and naming an emotion, understanding its intensity and body signals, choosing a calming tool, briefly reflecting on what happened, and reconnecting with the parent. The app is not a solo child tool — the parent is an active participant throughout. It runs as a responsive web app (no backend required for MVP) and works on laptop, iPhone, and iPad.

The MVP scope covers: emotion weather check-in, body map, intensity scale, calm toolbox, parent coaching scripts, a brief reflection screen, and skill-based reward badges.

---

## Glossary

- **App**: The Feelings Explorer responsive web application.
- **Child**: The young user (target age 5–10) participating in the session with a parent.
- **Parent**: The adult caregiver co-using the app alongside the child.
- **Session**: A single end-to-end use of the app from the Home Screen through to the Reconnect step, typically 5–10 minutes.
- **Weather Metaphor**: A visual weather icon (Sunny, Rainy, Stormy, Foggy, Windy, Sparkly, Heavy Clouds) used to represent an emotion family.
- **Emotion Family**: A group of related emotions mapped to a Weather Metaphor.
- **Body Map**: An illustrated outline of a child's body on which the child taps to indicate where a feeling is physically felt.
- **Intensity Scale**: A 1–5 visual scale (volcano/balloon/thermometer metaphor) representing how big a feeling is.
- **Emotion Word Card**: A tappable visual card displaying a single emotion label, grouped under an Emotion Family.
- **Calm Tool**: An animated, guided coping activity (breathing, body regulation, sensory, or connection-based) presented in the Calm Toolbox.
- **Parent Script**: A short coaching phrase shown to the Parent on-screen when the Child selects a strong emotion or high intensity.
- **Reflection Screen**: A brief, icon-driven screen where the pair reviews what happened and what helped.
- **Badge**: A skill-based visual reward awarded when the Child completes a specific emotional skill during a Session.
- **Evening Check-In**: A lightweight 3-minute ritual available from the Home Screen for end-of-day reflection.
- **Safety Section**: A parent-only area providing guidance on when to seek professional support.
- **Local State**: All session data stored in the browser's local storage with no data transmitted to a server.

---

## Requirements

### Requirement 1: Emotion Weather Check-In

**User Story:** As a parent and child, we want to start a session by picking a weather metaphor that matches the child's current emotional state, so that the child can begin identifying their feelings using a familiar, low-pressure visual language.

#### Acceptance Criteria

1. THE App SHALL display a Home Screen containing exactly seven tappable Weather Metaphor options: Sunny, Rainy, Stormy, Foggy, Windy, Sparkly, and Heavy Clouds.
2. THE App SHALL display each Weather Metaphor as a large illustrated icon accompanied by its label text.
3. WHEN the Child taps a Weather Metaphor, THE App SHALL highlight the selected option with a visible selected state and advance to the Body Map screen.
4. THE App SHALL map each Weather Metaphor to its designated Emotion Family: Sunny → Happy/Proud/Excited; Rainy → Sad/Lonely/Disappointed; Stormy → Angry/Frustrated/Jealous; Foggy → Confused/Unsure; Windy → Worried/Nervous; Sparkly → Silly/Playful/Energetic; Heavy Clouds → Tired/Overwhelmed.
5. THE App SHALL display the prompt text "How is your weather today?" on the Home Screen in a font size readable without magnification on a 375px-wide viewport.
6. THE App SHALL retain the selected Weather Metaphor in Local State for the duration of the Session.

---

### Requirement 2: Body Map — Interoception Check

**User Story:** As a parent and child, we want the child to tap where they feel the emotion in their body, so that the child develops interoceptive awareness and the parent understands the physical experience.

#### Acceptance Criteria

1. THE App SHALL display a Body Map screen showing a front-facing illustrated child body outline after a Weather Metaphor is selected.
2. THE App SHALL divide the Body Map into at least six tappable regions: head, throat, chest, tummy, hands, and legs.
3. WHEN the Child taps a body region, THE App SHALL visually highlight that region with a distinct colour or glow effect.
4. THE App SHALL allow the Child to select multiple body regions in a single session.
5. WHEN the Child taps an already-highlighted body region, THE App SHALL deselect that region and remove its highlight.
6. THE App SHALL display the prompt text "Where do you feel it in your body?" on the Body Map screen.
7. THE App SHALL provide a clearly labelled "Next" button that becomes active once at least one body region is selected, allowing the pair to advance to the Intensity Scale screen.
8. THE App SHALL retain all selected body regions in Local State for the duration of the Session.

---

### Requirement 3: Emotion Intensity Scale

**User Story:** As a parent and child, we want to rate how big the feeling is on a 1–5 scale, so that the child learns to gauge emotional intensity and the app can respond with appropriate guidance.

#### Acceptance Criteria

1. THE App SHALL display an Intensity Scale screen with five selectable levels numbered 1 through 5.
2. THE App SHALL represent the scale using a single consistent visual metaphor (volcano, balloon, or thermometer) where level 1 is the smallest state and level 5 is the largest/most intense state.
3. THE App SHALL display a descriptive label alongside each level: 1 → "Tiny feeling"; 2 → "Growing feeling"; 3 → "Big feeling"; 4 → "Too big"; 5 → "Eruption / meltdown".
4. WHEN the Child selects an intensity level, THE App SHALL highlight the selected level with a visible selected state.
5. WHEN the Child selects intensity level 4 or 5, THE App SHALL display the guidance message: "Your feeling is a [level]. That means we don't need to solve the problem yet. First, we help your body feel safe."
6. WHEN the Child selects intensity level 4 or 5, THE App SHALL display the relevant Parent Script for the selected Emotion Family on the Parent Script panel before advancing.
7. THE App SHALL provide a clearly labelled "Next" button that becomes active once an intensity level is selected, allowing the pair to advance to the Name It screen.
8. THE App SHALL retain the selected intensity level in Local State for the duration of the Session.

---

### Requirement 4: Name It to Tame It — Emotion Word Cards

**User Story:** As a parent and child, we want to browse specific emotion word cards grouped under the selected weather category, so that the child can find the most accurate name for their feeling and build emotional vocabulary.

#### Acceptance Criteria

1. THE App SHALL display a Name It screen showing Emotion Word Cards filtered to the Emotion Family corresponding to the Weather Metaphor selected in Requirement 1.
2. THE App SHALL display at least five Emotion Word Cards per Emotion Family, using the following sets: Stormy → Angry, Frustrated, Annoyed, Jealous, Treated Unfairly, Left Out; Rainy → Sad, Lonely, Disappointed, Hurt, Left Out; Windy → Worried, Nervous, Scared, Anxious, Unsure; Sunny → Happy, Proud, Excited, Grateful, Joyful; Foggy → Confused, Unsure, Overwhelmed, Lost; Sparkly → Silly, Playful, Energetic, Giddy, Excited; Heavy Clouds → Tired, Overwhelmed, Drained, Heavy, Bored.
3. THE App SHALL display each Emotion Word Card as a large tappable tile with the emotion label and a supporting illustration or emoji.
4. WHEN the Child taps an Emotion Word Card, THE App SHALL highlight it as selected.
5. THE App SHALL allow the Child to select exactly one Emotion Word Card per session.
6. THE App SHALL display the Parent Script prompt on the Name It screen: "I wonder if you're feeling [selected emotion] because… Did I get that right?" substituting the selected emotion label.
7. THE App SHALL display a "No, it's more like…" option that clears the current selection and allows the Child to choose a different Emotion Word Card.
8. THE App SHALL provide a clearly labelled "Next" button that becomes active once an Emotion Word Card is selected, allowing the pair to advance to the Calm Toolbox screen.
9. THE App SHALL retain the selected emotion label in Local State for the duration of the Session.

---

### Requirement 5: Calm Toolbox — Pick a Power

**User Story:** As a parent and child, we want to choose a calming activity from an illustrated toolbox, so that the child can regulate their nervous system before attempting to solve any problem.

#### Acceptance Criteria

1. THE App SHALL display a Calm Toolbox screen presenting at least five animated Calm Tool options drawn from the following categories: Breathing (e.g., Smell the Flower/Blow the Candle, Balloon Belly Breathing, Dragon Breath, Square Breathing); Body Regulation (e.g., Push the Wall, Squeeze-Release Fists, Turtle Shell Curl, Shake Out the Sillies, Stretch Like a Cat); Sensory Calming (e.g., Listen to Soft Sounds, Look for 5 Blue Things, Hug a Stuffed Animal, Drink Water); Connection Tools (e.g., "I Need Help", "Can I Have a Hug?", "Can We Try Again?", "Can I Have Space?").
2. THE App SHALL display each Calm Tool as a large tappable card with an animation, a short label, and a brief instruction (no more than one sentence).
3. WHEN the Child taps a Calm Tool card, THE App SHALL launch a full-screen guided activity view for that tool, including step-by-step animated instructions.
4. WHEN a breathing tool is selected, THE App SHALL provide a visual breathing guide (e.g., an expanding/contracting shape) that paces the Child through the exercise.
5. WHEN a Calm Tool guided activity is complete, THE App SHALL display a completion confirmation and return the Child to the Calm Toolbox screen or advance to the Reflection screen.
6. THE App SHALL display the prompt "Pick a power" on the Calm Toolbox screen.
7. THE App SHALL allow the Child to try more than one Calm Tool before advancing.
8. THE App SHALL provide a clearly labelled "I feel better" button that allows the pair to advance to the Reflection screen once at least one Calm Tool has been used.
9. THE App SHALL retain the list of Calm Tools used in Local State for the duration of the Session.

---

### Requirement 6: Parent Coaching Scripts

**User Story:** As a parent, I want to see short, evidence-informed coaching scripts in real time when my child selects a strong emotion, so that I know what to say and how to respond supportively without having to think of the right words myself.

#### Acceptance Criteria

1. THE App SHALL display a Parent Script panel visible to the Parent whenever the Child selects an Emotion Word Card or an intensity level of 4 or 5.
2. THE App SHALL display the following Parent Scripts mapped to Emotion Families: Stormy (Angry) → "You're really angry. I won't let you hit, but I will help you."; Rainy (Sad) → "That felt really disappointing. I'm here with you."; Windy (Worried) → "Your brain is trying to keep you safe. Let's check: is this a real danger or a worry thought?"; Foggy (Ashamed/Confused) → "You made a mistake. You are not bad. We can fix this."; Sunny → "I love seeing you feel this way. Tell me more!"; Sparkly → "You've got so much energy right now! Let's use it."; Heavy Clouds (Tired) → "It sounds like your body needs some rest. Let's go gently."
3. THE App SHALL visually distinguish the Parent Script panel from the Child-facing content (e.g., different background colour, a "For Grown-Ups" label).
4. WHEN no strong emotion or high intensity is active, THE App SHALL display a default Parent Script panel message: "Follow your child's lead. Stay calm and curious."
5. THE App SHALL display Parent Scripts in a font size readable at arm's length on a tablet screen without zooming.

---

### Requirement 7: Story Mode — Brief Reflection

**User Story:** As a parent and child, we want to briefly revisit what happened after the child has calmed down, so that the child builds narrative understanding of their emotions without pressure or lengthy journaling.

#### Acceptance Criteria

1. THE App SHALL display a Reflection screen after the Calm Toolbox step, presenting four sequential prompts: "What happened?", "What did you feel?", "What did your body want to do?", "What can we try next time?"
2. THE App SHALL present each prompt one at a time, advancing to the next prompt when the Child or Parent taps a "Next" button.
3. THE App SHALL provide response options for each prompt using icons, illustrated stickers, or pre-written short phrases — no free-text keyboard input SHALL be required.
4. THE App SHALL allow the Child to select one or more response options per prompt.
5. THE App SHALL display a "Skip" option on each prompt, allowing the pair to bypass any individual question without penalty.
6. THE App SHALL retain all Reflection responses in Local State for the duration of the Session.
7. WHEN all four prompts have been answered or skipped, THE App SHALL advance to the Problem-Solving screen.

---

### Requirement 8: Problem-Solving — Choose Your Next Brave Step

**User Story:** As a parent and child, we want to choose a constructive next action after reflecting, so that the child learns practical problem-solving skills and feels empowered rather than pressured.

#### Acceptance Criteria

1. THE App SHALL display a Problem-Solving screen only after the Reflection screen has been completed or skipped.
2. THE App SHALL present at least eight next-step options as large tappable tiles: Ask for Help, Use Words, Take a Break, Try Again, Make a Plan, Repair / Say Sorry, Ask for a Turn, Tell the Truth, Let It Go.
3. THE App SHALL NOT present "Repair / Say Sorry" as the first or only highlighted option, ensuring the Child is not pressured to apologise before regulation is complete.
4. WHEN the Child selects a next-step option, THE App SHALL display a brief encouraging message confirming the choice.
5. THE App SHALL allow the Child to select exactly one next-step option per session.
6. THE App SHALL provide a "Done" button that advances the pair to the Badge / Reward screen after a next-step option is selected.
7. THE App SHALL retain the selected next-step option in Local State for the duration of the Session.

---

### Requirement 9: Skill-Based Reward Badges

**User Story:** As a parent and child, we want the child to earn badges for practising emotional skills, so that the child is motivated by mastery rather than streaks or competition.

#### Acceptance Criteria

1. THE App SHALL award badges based on specific skill actions performed during a Session, not based on login streaks or frequency of use.
2. THE App SHALL support at least six badge types: Feeling Detective (named a feeling), Brave Breather (completed a breathing Calm Tool), Repair Hero (selected "Repair / Say Sorry" as a next step), Body Signal Spotter (selected at least one body region on the Body Map), Kind Words Champion (selected a Connection Tool from the Calm Toolbox), Try-Again Star (selected "Try Again" as a next step).
3. WHEN a badge-earning action is completed during a Session, THE App SHALL display a badge award animation at the end of the Session on a dedicated Badge screen.
4. THE App SHALL display all previously earned badges in a Badge Collection view accessible from the Home Screen.
5. THE App SHALL store earned badge data in Local State so that the Badge Collection persists across Sessions on the same device.
6. THE App SHALL NOT display competitive leaderboards, rankings, or comparisons between users.
7. THE App SHALL NOT award badges based on session count, daily streaks, or time spent in the app.

---

### Requirement 10: Evening Check-In Ritual

**User Story:** As a parent and child, we want a quick 3-minute end-of-day check-in, so that we can build a daily habit of emotional reflection without committing to a full session.

#### Acceptance Criteria

1. THE App SHALL provide an Evening Check-In mode accessible from the Home Screen via a clearly labelled button distinct from the main session flow.
2. THE App SHALL present four sequential prompts in Evening Check-In mode: "What was one feeling you had today?", "How big was it?", "What helped?", "What are you proud of?"
3. THE App SHALL present each prompt using the same icon-driven, low-reading-demand interface as the main session flow.
4. THE App SHALL complete the Evening Check-In flow in no more than four screens.
5. WHEN the Evening Check-In is completed, THE App SHALL display a brief positive closing message and return to the Home Screen.
6. THE App SHALL retain Evening Check-In responses in Local State.

---

### Requirement 11: Safety and Escalation — Parent-Only Section

**User Story:** As a parent, I want access to guidance on when to seek professional help, so that I can make informed decisions if my child's emotional needs exceed what this app can support.

#### Acceptance Criteria

1. THE App SHALL provide a Safety Section accessible only after the Parent confirms they are the adult, via a clearly labelled "For Grown-Ups" entry point on the Home Screen.
2. THE App SHALL display guidance in the Safety Section covering at least three escalation scenarios: when to consult a paediatrician, when to contact a school counsellor, and when to seek a child psychologist.
3. THE App SHALL present the Safety Section content in plain language without clinical jargon.
4. THE App SHALL NOT require account creation or login to access the Safety Section.
5. THE App SHALL display a disclaimer in the Safety Section stating that the app is not a substitute for professional mental health support.

---

### Requirement 12: Responsive Layout and Accessibility

**User Story:** As a parent and child, we want the app to work comfortably on a laptop, iPhone, and iPad, so that we can use it on whatever device is available.

#### Acceptance Criteria

1. THE App SHALL render all screens correctly on viewport widths from 375px (iPhone SE) to 1440px (desktop) without horizontal scrolling.
2. THE App SHALL display all interactive elements (buttons, cards, body map regions) at a minimum touch target size of 44×44 CSS pixels.
3. THE App SHALL use a warm, illustrated visual style consistent across all screens, with large buttons and minimal reading demand for the Child-facing content.
4. THE App SHALL support voice narration for all Child-facing prompt text, playable via a clearly visible speaker icon on each screen.
5. THE App SHALL NOT require the Child to type text at any point during a Session or Evening Check-In.
6. THE App SHALL use colour contrast ratios of at least 4.5:1 for all body text against its background.
7. THE App SHALL display no advertisements, social sharing features, public profiles, or competitive leaderboards at any point.

---

### Requirement 13: Session State and Data Privacy

**User Story:** As a parent, I want all session data to stay on the device with no account required, so that my child's emotional data is private and the app is safe to use without sign-up friction.

#### Acceptance Criteria

1. THE App SHALL store all Session data, Badge Collection data, and Evening Check-In data exclusively in the browser's Local State (localStorage or equivalent).
2. THE App SHALL NOT transmit any user data, session data, or device identifiers to any external server.
3. THE App SHALL NOT require account creation, login, or email address to use any feature.
4. THE App SHALL provide a "Clear All Data" option in the Settings or Parent section that removes all locally stored data from the device.
5. WHEN the "Clear All Data" action is confirmed by the Parent, THE App SHALL delete all locally stored data and return to the Home Screen.
6. THE App SHALL function fully offline after the initial page load, with no network dependency for any core feature.

---

### Requirement 14: Session Flow Integrity

**User Story:** As a parent and child, we want the session to follow a logical, child-safe order, so that the child is always regulated before being asked to reflect or problem-solve.

#### Acceptance Criteria

1. THE App SHALL enforce the following Session screen order: Home Screen → Body Map → Intensity Scale → Name It → Calm Toolbox → Reflection → Problem-Solving → Badge Screen.
2. THE App SHALL NOT allow the pair to advance to the Reflection screen until at least one Calm Tool has been used in the current Session.
3. THE App SHALL NOT allow the pair to advance to the Problem-Solving screen until the Reflection screen has been reached (even if all prompts are skipped).
4. THE App SHALL provide a visible "Back" navigation option on every screen except the Home Screen, allowing the pair to return to the previous step.
5. WHEN the pair navigates back to a previous screen, THE App SHALL restore the selections made on that screen from Local State.
6. THE App SHALL display a session progress indicator (e.g., step dots or a progress bar) on every screen within the Session flow so the pair can see how far along they are.
