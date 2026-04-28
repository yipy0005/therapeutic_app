import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { loadDataForProfile, clearDataForProfile, deleteProfile as deleteProfileFromStorage } from '../storage/adapter';
import type { EmotionHistoryRecord, Profile } from '../types';
import styles from './ParentSafetySection.module.css';

// ---------------------------------------------------------------------------
// Escalation scenarios
// ---------------------------------------------------------------------------
const SCENARIOS = [
  {
    emoji: '🩺',
    title: 'Talk to your Paediatrician',
    body: "If your child's emotional difficulties are affecting their sleep, eating, or physical health, or if you're concerned about development.",
  },
  {
    emoji: '🏫',
    title: 'Contact a School Counsellor',
    body: 'If emotions are affecting learning, friendships, or behaviour at school. School counsellors can also connect you with further support.',
  },
  {
    emoji: '🧠',
    title: 'See a Child Psychologist',
    body: "If your child experiences intense, frequent, or prolonged emotional distress, anxiety, or behavioural challenges that don't improve over time.",
  },
] as const;

// ---------------------------------------------------------------------------
// Weather emoji map
// ---------------------------------------------------------------------------
const WEATHER_EMOJI: Record<string, string> = {
  sunny: '☀️', sparkly: '✨', rainy: '🌧️',
  stormy: '⛈️', foggy: '🌫️', windy: '💨', 'heavy-clouds': '☁️',
};

const INTENSITY_COLOUR: Record<number, string> = {
  1: '#4caf50', 2: '#8bc34a', 3: '#ff9800', 4: '#f44336', 5: '#9c27b0',
};

// ---------------------------------------------------------------------------
// AdultConfirmGate
// ---------------------------------------------------------------------------
function AdultConfirmGate({ onConfirm, onBack }: { onConfirm: () => void; onBack: () => void }) {
  return (
    <div className={styles.gateWrapper}>
      <span className={styles.gateEmoji} aria-hidden="true">👋</span>
      <p className={styles.gatePrompt}>Are you a grown-up?</p>
      <div className={styles.gateActions}>
        <button type="button" className={styles.primaryButton} onClick={onConfirm}>
          Yes, I&apos;m a grown-up 👋
        </button>
        <button type="button" className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfileSelector — pick which child to view
// ---------------------------------------------------------------------------
function ProfileSelector({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: Profile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (profiles.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <span aria-hidden="true">👶</span>
        <p>No profiles yet. Create a profile from the home screen to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.profileSelector} role="radiogroup" aria-label="Select a child">
      {profiles.map((p) => (
        <button
          key={p.id}
          type="button"
          role="radio"
          aria-checked={selectedId === p.id}
          className={`${styles.profileChip} ${selectedId === p.id ? styles.profileChipActive : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <span aria-hidden="true">{p.emoji}</span> {p.name}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmotionHistoryTab
// ---------------------------------------------------------------------------
function EmotionHistoryTab({ records }: { records: EmotionHistoryRecord[] }) {
  if (records.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <span aria-hidden="true">📭</span>
        <p>No sessions recorded yet. Complete a session with your child to see their emotion history here.</p>
      </div>
    );
  }

  const byDate: Record<string, EmotionHistoryRecord[]> = {};
  records.forEach((r) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  return (
    <div className={styles.historyList}>
      {Object.entries(byDate).map(([date, dayRecords]) => (
        <div key={date} className={styles.historyDay}>
          <p className={styles.historyDate}>
            {new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </p>
          {dayRecords.map((r) => (
            <div key={r.id} className={`${styles.historyCard} ${r.valence === 'positive' ? styles.positive : styles.negative}`}>
              <div className={styles.historyCardHeader}>
                <span className={styles.historyWeather} aria-label={r.weather}>
                  {WEATHER_EMOJI[r.weather] ?? '🌤️'}
                </span>
                <div className={styles.historyCardMain}>
                  <span className={styles.historyEmotion}>{r.emotions.join(', ')}</span>
                  <span className={styles.historyTime}>{r.time}</span>
                </div>
                <span
                  className={styles.historyIntensity}
                  style={{ backgroundColor: INTENSITY_COLOUR[r.intensity] }}
                  aria-label={`Intensity ${r.intensity}`}
                >
                  {r.intensity}
                </span>
              </div>
              {r.bodyRegions.length > 0 && (
                <p className={styles.historyDetail}>Body: {r.bodyRegions.join(', ')}</p>
              )}
              {r.calmToolsUsed.length > 0 && (
                <p className={styles.historyDetail}>Calm tools: {r.calmToolsUsed.join(', ')}</p>
              )}
              {r.nextStep && (
                <p className={styles.historyDetail}>Next step: {r.nextStep}</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: build daily summaries from records
// ---------------------------------------------------------------------------
interface DaySummary {
  date: string;
  dateLabel: string;
  sessions: number;
  avgIntensity: number;
  topEmotion: string;
  topWeather: string;
  weatherEmoji: string;
  positiveCount: number;
  negativeCount: number;
}

function buildDaySummaries(records: EmotionHistoryRecord[]): DaySummary[] {
  const byDate: Record<string, EmotionHistoryRecord[]> = {};
  records.forEach((r) => {
    if (!byDate[r.date]) byDate[r.date] = [];
    byDate[r.date].push(r);
  });

  return Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, dayRecords]) => {
      const avgIntensity = dayRecords.reduce((sum, r) => sum + r.intensity, 0) / dayRecords.length;

      const emotionCounts: Record<string, number> = {};
      dayRecords.forEach((r) => {
        r.emotions.forEach((e) => { emotionCounts[e] = (emotionCounts[e] ?? 0) + 1; });
      });
      const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];

      const weatherCounts: Record<string, number> = {};
      dayRecords.forEach((r) => { weatherCounts[r.weather] = (weatherCounts[r.weather] ?? 0) + 1; });
      const topWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];

      return {
        date,
        dateLabel: new Date(date + 'T12:00:00').toLocaleDateString(undefined, {
          weekday: 'short', day: 'numeric', month: 'short',
        }),
        sessions: dayRecords.length,
        avgIntensity: Math.round(avgIntensity * 10) / 10,
        topEmotion,
        topWeather,
        weatherEmoji: WEATHER_EMOJI[topWeather] ?? '🌤️',
        positiveCount: dayRecords.filter((r) => r.valence === 'positive').length,
        negativeCount: dayRecords.filter((r) => r.valence === 'negative').length,
      };
    });
}

// ---------------------------------------------------------------------------
// DailyTrendsTab
// ---------------------------------------------------------------------------
function DailyTrendsTab({ records }: { records: EmotionHistoryRecord[] }) {
  const summaries = useMemo(() => buildDaySummaries(records), [records]);

  if (summaries.length === 0) {
    return (
      <div className={styles.emptyHistory}>
        <span aria-hidden="true">📊</span>
        <p>No data yet. Complete sessions with your child to see daily trends here.</p>
      </div>
    );
  }

  const totalSessions = records.length;
  const totalDays = summaries.length;
  const overallAvgIntensity =
    Math.round((records.reduce((s, r) => s + r.intensity, 0) / totalSessions) * 10) / 10;

  const allEmotionCounts: Record<string, number> = {};
  records.forEach((r) => {
    r.emotions.forEach((e) => { allEmotionCounts[e] = (allEmotionCounts[e] ?? 0) + 1; });
  });
  const sortedEmotions = Object.entries(allEmotionCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className={styles.trendsWrapper}>
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalSessions}</span>
          <span className={styles.statLabel}>Sessions</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalDays}</span>
          <span className={styles.statLabel}>Days</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{overallAvgIntensity}</span>
          <span className={styles.statLabel}>Avg intensity</span>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <p className={styles.sectionTitle}>Most common feelings</p>
        <div className={styles.emotionBarList}>
          {sortedEmotions.slice(0, 5).map(([emotion, count]) => (
            <div key={emotion} className={styles.emotionBarRow}>
              <span className={styles.emotionBarLabel}>{emotion}</span>
              <div className={styles.emotionBarTrack}>
                <div className={styles.emotionBarFill} style={{ width: `${Math.round((count / totalSessions) * 100)}%` }} />
              </div>
              <span className={styles.emotionBarCount}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.sectionCard}>
        <p className={styles.sectionTitle}>Day by day</p>
        <div className={styles.dayTimeline}>
          {summaries.map((day) => (
            <div key={day.date} className={styles.dayRow}>
              <div className={styles.dayMeta}>
                <span className={styles.dayDate}>{day.dateLabel}</span>
                <span className={styles.dayWeather} aria-label={day.topWeather}>{day.weatherEmoji}</span>
              </div>
              <div className={styles.dayContent}>
                <div className={styles.intensityBar}>
                  <div
                    className={styles.intensityBarFill}
                    style={{
                      width: `${(day.avgIntensity / 5) * 100}%`,
                      backgroundColor: INTENSITY_COLOUR[Math.round(day.avgIntensity)] ?? '#ff9800',
                    }}
                  />
                </div>
                <div className={styles.dayDetails}>
                  <span className={styles.dayEmotion}>{day.topEmotion}</span>
                  <span className={styles.daySessionCount}>{day.sessions} session{day.sessions !== 1 ? 's' : ''}</span>
                  {day.positiveCount > 0 && day.negativeCount > 0 && (
                    <span className={styles.dayValenceSplit}>😊{day.positiveCount} · 😟{day.negativeCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GetHelpTab
// ---------------------------------------------------------------------------
function GetHelpTab() {
  return (
    <>
      <p className={styles.disclaimer}>
        This app is a tool to support emotional learning — it is not a substitute
        for professional mental health support.
      </p>
      <ul className={styles.cardList} aria-label="Escalation scenarios">
        {SCENARIOS.map((s) => (
          <li key={s.title} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardEmoji} aria-hidden="true">{s.emoji}</span>
              <span className={styles.cardTitle}>{s.title}</span>
            </div>
            <p className={styles.cardBody}>{s.body}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

// ---------------------------------------------------------------------------
// ParentContent — tabbed view with profile selector
// ---------------------------------------------------------------------------
function ParentContent({ onBack }: { onBack: () => void }) {
  const { profiles, removeProfile } = useProfile();
  const [tab, setTab] = useState<'trends' | 'history' | 'help'>('trends');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles.length > 0 ? profiles[0].id : null
  );
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const records: EmotionHistoryRecord[] = useMemo(() => {
    if (!selectedProfileId) return [];
    return loadDataForProfile(selectedProfileId).emotionHistory ?? [];
  }, [selectedProfileId]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  const handleClearData = () => {
    if (!selectedProfileId) return;
    clearDataForProfile(selectedProfileId);
    setShowConfirm(false);
    // Force re-render by toggling profile
    setSelectedProfileId(null);
    setTimeout(() => setSelectedProfileId(selectedProfileId), 0);
  };

  const handleDeleteProfile = () => {
    if (!selectedProfileId) return;
    deleteProfileFromStorage(selectedProfileId);
    removeProfile(selectedProfileId);
    const remaining = profiles.filter((p) => p.id !== selectedProfileId);
    setSelectedProfileId(remaining.length > 0 ? remaining[0].id : null);
    setShowConfirm(false);
  };

  return (
    <>
      <h1 className={styles.heading}>For Grown-Ups 💙</h1>

      {/* Profile selector */}
      <ProfileSelector
        profiles={profiles}
        selectedId={selectedProfileId}
        onSelect={setSelectedProfileId}
      />

      {selectedProfile && (
        <>
          {/* Tabs */}
          <div className={styles.tabs} role="tablist">
            <button
              role="tab" type="button" aria-selected={tab === 'trends'}
              className={`${styles.tab} ${tab === 'trends' ? styles.tabActive : ''}`}
              onClick={() => setTab('trends')}
            >
              📈 Trends
            </button>
            <button
              role="tab" type="button" aria-selected={tab === 'history'}
              className={`${styles.tab} ${tab === 'history' ? styles.tabActive : ''}`}
              onClick={() => setTab('history')}
            >
              📊 History
            </button>
            <button
              role="tab" type="button" aria-selected={tab === 'help'}
              className={`${styles.tab} ${tab === 'help' ? styles.tabActive : ''}`}
              onClick={() => setTab('help')}
            >
              💙 Get Help
            </button>
          </div>

          <div className={styles.tabContent}>
            {tab === 'trends' && <DailyTrendsTab records={records} />}
            {tab === 'history' && <EmotionHistoryTab records={records} />}
            {tab === 'help' && <GetHelpTab />}
          </div>

          {showConfirm ? (
            <div className={styles.confirmDialog} role="alertdialog" aria-labelledby="confirm-title">
              <p id="confirm-title" className={styles.confirmMessage}>
                What would you like to do with {selectedProfile.emoji} {selectedProfile.name}&apos;s data?
              </p>
              <div className={styles.confirmActions}>
                <button type="button" className={styles.destructiveButton} onClick={handleClearData}>
                  Clear history only
                </button>
                <button type="button" className={styles.destructiveButton} onClick={handleDeleteProfile}>
                  Delete profile entirely
                </button>
                <button type="button" className={styles.backButton} onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className={styles.clearDataButton} onClick={() => setShowConfirm(true)}>
              🗑️ Manage {selectedProfile.name}&apos;s Data
            </button>
          )}
        </>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ParentSafetySection — top-level screen
// ---------------------------------------------------------------------------
export function ParentSafetySection() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <main className={styles.screen}>
      {confirmed ? (
        <ParentContent onBack={() => navigate('/profiles')} />
      ) : (
        <AdultConfirmGate
          onConfirm={() => setConfirmed(true)}
          onBack={() => navigate('/profiles')}
        />
      )}
    </main>
  );
}
