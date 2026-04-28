// Weather metaphor — represents an emotion family
export type WeatherMetaphor =
  | 'sunny'
  | 'rainy'
  | 'stormy'
  | 'foggy'
  | 'windy'
  | 'sparkly'
  | 'heavy-clouds';

// Body regions selectable on the body map
export type BodyRegion = 'head' | 'throat' | 'chest' | 'tummy' | 'hands' | 'legs';

// All steps in the session flow (enforced order)
export type SessionStep =
  | 'home'
  | 'body-map'
  | 'intensity'
  | 'name-it'
  | 'share'           // positive flow: celebrate + share what caused the feeling
  | 'calm-toolbox'
  | 'calm-activity'
  | 'reflection'
  | 'problem-solving'
  | 'badge-screen';

// Whether the selected emotion is positive or negative
export type EmotionValence = 'positive' | 'negative';

// Skill-based badge types
export type BadgeType =
  | 'feeling-detective'
  | 'brave-breather'
  | 'repair-hero'
  | 'body-signal-spotter'
  | 'kind-words-champion'
  | 'try-again-star';

// Full session state persisted in localStorage
export interface SessionState {
  weatherMetaphor: WeatherMetaphor | null;
  bodyRegions: BodyRegion[];
  intensityLevel: 1 | 2 | 3 | 4 | 5 | null;
  selectedEmotions: string[];
  emotionValence: EmotionValence | null;
  calmToolsUsed: string[];
  reflectionResponses: Record<number, string[]>;
  nextStep: string | null;
  currentStep: SessionStep;
}

// Badge collection state
export interface BadgeState {
  earned: BadgeType[];
}

// A calm tool card in the toolbox
export interface CalmTool {
  id: string;
  label: string;
  category: 'breathing' | 'body' | 'sensory' | 'connection';
  instruction: string;
  hasBreathingGuide: boolean;
}

// An emotion word card shown on the Name It screen
export interface EmotionWord {
  label: string;
  emoji: string;
  family: WeatherMetaphor;
}

// A single completed session saved to history
export interface EmotionHistoryRecord {
  id: string;           // timestamp-based unique id
  date: string;         // ISO date string YYYY-MM-DD
  time: string;         // HH:MM
  weather: WeatherMetaphor;
  emotions: string[];
  valence: EmotionValence;
  intensity: 1 | 2 | 3 | 4 | 5;
  bodyRegions: BodyRegion[];
  calmToolsUsed: string[];
  nextStep: string | null;
}

// Top-level localStorage schema
export interface StoredData {
  version: 1;
  currentSession: SessionState | null;
  badgeCollection: BadgeType[];
  emotionHistory: EmotionHistoryRecord[];
}
