import type { LevelData } from '../content/schema';
import type { LevelProgress } from '../stores/progress';

export function isLevelUnlocked(
  levels: LevelData[],
  index: number,
  progress: Record<string, LevelProgress>,
): boolean {
  if (index === 0) return true;
  const prev = levels[index - 1];
  return (progress[prev.id]?.stars ?? 0) > 0;
}