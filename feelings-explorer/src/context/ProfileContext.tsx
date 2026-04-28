import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Profile, ProfileRegistry } from '../types';
import { loadRegistry, saveRegistry, setActiveProfile as setActiveInStorage } from '../storage/adapter';

// ---------------------------------------------------------------------------
// Emoji options for profile creation
// ---------------------------------------------------------------------------
export const PROFILE_EMOJIS = ['🦊', '🐻', '🐰', '🦁', '🐸', '🦋', '🐢', '🐙', '🦄', '🐳', '🐼', '🐨'];

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface ProfileContextValue {
  profiles: Profile[];
  activeProfile: Profile | null;
  switchProfile: (id: string) => void;
  createProfile: (name: string, emoji: string) => Profile;
  removeProfile: (id: string) => void;
  clearActiveProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [registry, setRegistry] = useState<ProfileRegistry>(() => {
    const reg = loadRegistry();
    // Sync the adapter's active profile on mount so SessionProvider/BadgeProvider
    // read from the correct storage key
    if (reg.activeProfileId) {
      setActiveInStorage(reg.activeProfileId);
    }
    return reg;
  });

  const persist = useCallback((updated: ProfileRegistry) => {
    setRegistry(updated);
    saveRegistry(updated);
  }, []);

  const activeProfile = registry.profiles.find((p) => p.id === registry.activeProfileId) ?? null;

  const switchProfile = useCallback((id: string) => {
    setActiveInStorage(id);
    persist({ ...registry, activeProfileId: id });
    // Force full reload so SessionProvider + BadgeProvider re-init from new storage key
    window.location.replace('#/');
    window.location.reload();
  }, [registry, persist]);

  const createProfile = useCallback((name: string, emoji: string): Profile => {
    const profile: Profile = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      emoji,
      createdAt: new Date().toISOString(),
    };
    const updated: ProfileRegistry = {
      profiles: [...registry.profiles, profile],
      activeProfileId: profile.id,
    };
    setActiveInStorage(profile.id);
    persist(updated);
    return profile;
  }, [registry, persist]);

  const removeProfile = useCallback((id: string) => {
    const updated: ProfileRegistry = {
      profiles: registry.profiles.filter((p) => p.id !== id),
      activeProfileId: registry.activeProfileId === id ? null : registry.activeProfileId,
    };
    if (registry.activeProfileId === id) {
      setActiveInStorage(null);
    }
    persist(updated);
  }, [registry, persist]);

  const clearActiveProfile = useCallback(() => {
    setActiveInStorage(null);
    persist({ ...registry, activeProfileId: null });
  }, [registry, persist]);

  return (
    <ProfileContext.Provider value={{ profiles: registry.profiles, activeProfile, switchProfile, createProfile, removeProfile, clearActiveProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
