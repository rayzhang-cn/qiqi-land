import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LevelProgress {
  stars: number;
  attempts: number;
  correct: number;
}

interface ProgressState {
  byProfile: Record<string, Record<string, LevelProgress>>;
  recordAttempt: (profileId: string, levelId: string, correct: boolean, stars: number) => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      byProfile: {},
      recordAttempt: (profileId, levelId, correct, stars) =>
        set((s) => {
          const profile = s.byProfile[profileId] ?? {};
          const prev = profile[levelId] ?? { stars: 0, attempts: 0, correct: 0 };
          const next: LevelProgress = {
            stars: correct ? Math.max(prev.stars, stars) : prev.stars,
            attempts: prev.attempts + 1,
            correct: prev.correct + (correct ? 1 : 0),
          };
          return { byProfile: { ...s.byProfile, [profileId]: { ...profile, [levelId]: next } } };
        }),
    }),
    { name: 'qiqi-progress' },
  ),
);