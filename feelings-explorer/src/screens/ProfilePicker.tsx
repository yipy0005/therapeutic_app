import React, { useState } from 'react';
import { useProfile, PROFILE_EMOJIS } from '../context/ProfileContext';
import { setActiveProfile } from '../storage/adapter';
import styles from './ProfilePicker.module.css';

// ---------------------------------------------------------------------------
// CreateProfileForm
// ---------------------------------------------------------------------------
function CreateProfileForm({ onDone }: { onDone: () => void }) {
  const { createProfile } = useProfile();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(PROFILE_EMOJIS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const profile = createProfile(trimmed, emoji);
    setActiveProfile(profile.id);
    // Reload to re-init providers with new profile storage
    window.location.replace('#/');
    window.location.reload();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <p className={styles.formTitle}>New Explorer</p>

      <div className={styles.emojiGrid} role="radiogroup" aria-label="Pick an avatar">
        {PROFILE_EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className={`${styles.emojiOption} ${emoji === e ? styles.emojiSelected : ''}`}
            onClick={() => setEmoji(e)}
            aria-pressed={emoji === e}
            aria-label={e}
          >
            {e}
          </button>
        ))}
      </div>

      <input
        className={styles.nameInput}
        type="text"
        placeholder="What's your name?"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        autoFocus
        aria-label="Name"
      />

      <button
        type="submit"
        className={styles.createButton}
        disabled={!name.trim()}
      >
        Let's go! 🚀
      </button>

      <button type="button" className={styles.cancelButton} onClick={onDone}>
        Cancel
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// ProfilePicker screen
// ---------------------------------------------------------------------------
export function ProfilePicker() {
  const { profiles, switchProfile } = useProfile();
  const [showCreate, setShowCreate] = useState(false);

  if (showCreate) {
    return (
      <main className={styles.screen}>
        <CreateProfileForm onDone={() => setShowCreate(false)} />
      </main>
    );
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.heading}>Who's exploring today?</h1>

      {profiles.length > 0 && (
        <div className={styles.profileGrid}>
          {profiles.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.profileCard}
              onClick={() => switchProfile(p.id)}
              aria-label={p.name}
            >
              <span className={styles.profileEmoji}>{p.emoji}</span>
              <span className={styles.profileName}>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className={styles.addButton}
        onClick={() => setShowCreate(true)}
      >
        + New Explorer
      </button>

      <a href="#/parent-safety" className={styles.parentLink}>
        👋 For Grown-Ups
      </a>
    </main>
  );
}
