import { isLevelUnlocked } from './unlock';
import type { LevelData } from '../content/schema';

const level = (id: string, order: number): LevelData => ({
  id,
  chapter: 'c1',
  order,
  domain: 'math',
  ageBand: '3-4',
  template: 'count',
  voicePrompt: '数一数',
  reward: { stars: 1 },
  data: { objects: [{ emoji: '🍎', count: 1 }], choices: [1, 2], answer: 1 },
});

describe('isLevelUnlocked', () => {
  const levels = [level('l1', 1), level('l2', 2), level('l3', 3)];

  it('第一关始终解锁', () => {
    expect(isLevelUnlocked(levels, 0, {})).toBe(true);
  });

  it('前一关得星后解锁下一关', () => {
    const progress = { l1: { stars: 1, attempts: 1, correct: 1 } };
    expect(isLevelUnlocked(levels, 1, progress)).toBe(true);
  });

  it('前一关未得星则锁定', () => {
    expect(isLevelUnlocked(levels, 2, {})).toBe(false);
  });
});