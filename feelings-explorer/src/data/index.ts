import type {
  WeatherMetaphor,
  BadgeType,
  CalmTool,
  SessionState,
  SessionStep,
} from '../types';

// ---------------------------------------------------------------------------
// Weather → Emotion Family mapping
// ---------------------------------------------------------------------------
export const WEATHER_EMOTION_MAP: Record<WeatherMetaphor, string[]> = {
  sunny: ['Happy', 'Proud', 'Excited', 'Grateful', 'Joyful'],
  rainy: ['Sad', 'Lonely', 'Disappointed', 'Hurt', 'Left Out'],
  stormy: ['Angry', 'Frustrated', 'Annoyed', 'Jealous', 'Treated Unfairly', 'Left Out'],
  foggy: ['Confused', 'Unsure', 'Overwhelmed', 'Lost'],
  windy: ['Worried', 'Nervous', 'Scared', 'Anxious', 'Unsure'],
  sparkly: ['Silly', 'Playful', 'Energetic', 'Giddy', 'Excited'],
  'heavy-clouds': ['Tired', 'Overwhelmed', 'Drained', 'Heavy', 'Bored'],
};

// ---------------------------------------------------------------------------
// Parent coaching scripts
// ---------------------------------------------------------------------------
export const PARENT_SCRIPTS: Record<WeatherMetaphor, string> = {
  stormy: "You're really angry. I won't let you hit, but I will help you.",
  rainy: "That felt really disappointing. I'm here with you.",
  windy: "Your brain is trying to keep you safe. Let's check: is this a real danger or a worry thought?",
  foggy: "You made a mistake. You are not bad. We can fix this.",
  sunny: "I love seeing you feel this way. Tell me more!",
  sparkly: "You've got so much energy right now! Let's use it.",
  'heavy-clouds': "It sounds like your body needs some rest. Let's go gently.",
};

export const DEFAULT_PARENT_SCRIPT = "Follow your child's lead. Stay calm and curious.";

// ---------------------------------------------------------------------------
// Intensity scale labels
// ---------------------------------------------------------------------------
export const INTENSITY_LABELS: Record<number, string> = {
  1: 'Tiny feeling',
  2: 'Growing feeling',
  3: 'Big feeling',
  4: 'Too big',
  5: 'Eruption / meltdown',
};

// ---------------------------------------------------------------------------
// Calm tools
// ---------------------------------------------------------------------------
export const CALM_TOOLS: Record<string, CalmTool> = {
  'smell-flower': {
    id: 'smell-flower',
    label: 'Smell the Flower / Blow the Candle',
    category: 'breathing',
    instruction: 'Breathe in slowly through your nose like you are smelling a flower, then breathe out gently through your mouth like you are blowing out a candle.',
    hasBreathingGuide: true,
  },
  'balloon-belly': {
    id: 'balloon-belly',
    label: 'Balloon Belly Breathing',
    category: 'breathing',
    instruction: 'Put your hands on your tummy and breathe in slowly to make your belly grow like a balloon, then breathe out to let it shrink.',
    hasBreathingGuide: true,
  },
  'dragon-breath': {
    id: 'dragon-breath',
    label: 'Dragon Breath',
    category: 'breathing',
    instruction: 'Take a big breath in, then breathe out hard through your mouth like a dragon breathing fire — make it loud!',
    hasBreathingGuide: true,
  },
  'square-breathing': {
    id: 'square-breathing',
    label: 'Square Breathing',
    category: 'breathing',
    instruction: 'Breathe in for 4 counts, hold for 4, breathe out for 4, hold for 4 — trace a square with your finger as you go.',
    hasBreathingGuide: true,
  },
  'push-wall': {
    id: 'push-wall',
    label: 'Push the Wall',
    category: 'body',
    instruction: 'Stand in front of a wall, place both hands flat on it, and push as hard as you can for 10 seconds.',
    hasBreathingGuide: false,
  },
  'squeeze-fists': {
    id: 'squeeze-fists',
    label: 'Squeeze-Release Fists',
    category: 'body',
    instruction: 'Squeeze your hands into tight fists for 5 seconds, then open them wide and let all the tension go.',
    hasBreathingGuide: false,
  },
  'shake-sillies': {
    id: 'shake-sillies',
    label: 'Shake Out the Sillies',
    category: 'body',
    instruction: 'Stand up and shake your hands, arms, legs, and whole body for 30 seconds to wiggle out the big feelings.',
    hasBreathingGuide: false,
  },
  'listen-sounds': {
    id: 'listen-sounds',
    label: 'Listen to Soft Sounds',
    category: 'sensory',
    instruction: 'Close your eyes and listen carefully — can you name 3 different sounds you can hear right now?',
    hasBreathingGuide: false,
  },
  'look-blue': {
    id: 'look-blue',
    label: 'Look for 5 Blue Things',
    category: 'sensory',
    instruction: 'Look around the room and find 5 things that are blue — point to each one as you spot it.',
    hasBreathingGuide: false,
  },
  'need-help': {
    id: 'need-help',
    label: 'I Need Help',
    category: 'connection',
    instruction: 'Tell a grown-up "I need help right now" — asking for help is a superpower.',
    hasBreathingGuide: false,
  },
  'can-hug': {
    id: 'can-hug',
    label: 'Can I Have a Hug?',
    category: 'connection',
    instruction: 'Ask someone you trust for a hug — hugs help your body feel safe and calm.',
    hasBreathingGuide: false,
  },
};

// ---------------------------------------------------------------------------
// Badge earning conditions
// ---------------------------------------------------------------------------
export const BADGE_CONDITIONS: Record<BadgeType, (session: SessionState) => boolean> = {
  'feeling-detective': (s) => s.selectedEmotion !== null,
  'brave-breather': (s) =>
    s.calmToolsUsed.some((id) => CALM_TOOLS[id]?.category === 'breathing'),
  'repair-hero': (s) => s.nextStep === 'Repair / Say Sorry',
  'body-signal-spotter': (s) => s.bodyRegions.length >= 1,
  'kind-words-champion': (s) =>
    s.calmToolsUsed.some((id) => CALM_TOOLS[id]?.category === 'connection'),
  'try-again-star': (s) => s.nextStep === 'Try Again',
};

// ---------------------------------------------------------------------------
// Session step order (enforced flow)
// ---------------------------------------------------------------------------
export const STEP_ORDER: SessionStep[] = [
  'home',
  'body-map',
  'intensity',
  'name-it',
  'calm-toolbox',
  'reflection',
  'problem-solving',
  'badge-screen',
];

// ---------------------------------------------------------------------------
// Convenience arrays for property-based tests and iteration
// ---------------------------------------------------------------------------
export const ALL_WEATHER_METAPHORS: WeatherMetaphor[] = [
  'sunny',
  'rainy',
  'stormy',
  'foggy',
  'windy',
  'sparkly',
  'heavy-clouds',
];

export const ALL_BADGE_TYPES: BadgeType[] = [
  'feeling-detective',
  'brave-breather',
  'repair-hero',
  'body-signal-spotter',
  'kind-words-champion',
  'try-again-star',
];
