import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface ProfilesState {
  profiles: Profile[];
  activeId: string | null;
  addProfile: (p: Omit<Profile, 'id'>) => string;
  setActive: (id: string | null) => void;
}

function generateId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      addProfile: (p) => {
        const id = generateId();
        set((s) => ({ profiles: [...s.profiles, { ...p, id }] }));
        return id;
      },
      setActive: (id) => set({ activeId: id }),
    }),
    { name: 'qiqi-profiles' },
  ),
);