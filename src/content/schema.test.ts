import { LevelSchema } from './schema';

const base = {
  id: 'l1',
  chapter: 'math-ch1',
  order: 1,
  domain: 'math',
  ageBand: '3-4',
  voicePrompt: '数一数',
  reward: { stars: 1 },
};

describe('LevelSchema', () => {
  it('接受合法的数数关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'count',
      data: { objects: [{ emoji: '🍎', count: 3 }], choices: [2, 3, 4], answer: 3 },
    });
    expect(result.success).toBe(true);
  });

  it('接受合法的点选关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'tap-identify',
      data: {
        cards: [
          { id: 'a', emoji: '🍎', label: '红苹果' },
          { id: 'b', emoji: '🍏', label: '青苹果' },
        ],
        answerCardId: 'a',
      },
    });
    expect(result.success).toBe(true);
  });

  it('拒绝缺少 answer 的数数关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'count',
      data: { objects: [{ emoji: '🍎', count: 3 }], choices: [2, 3] },
    });
    expect(result.success).toBe(false);
  });

  it('拒绝未知的模板名', () => {
    const result = LevelSchema.safeParse({ ...base, template: 'unknown', data: {} });
    expect(result.success).toBe(false);
  });

  it('拒绝 answer 不在 choices 中的数数关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'count',
      data: { objects: [{ emoji: '🍎', count: 3 }], choices: [2, 4, 5], answer: 3 },
    });
    expect(result.success).toBe(false);
  });

  it('拒绝 answerCardId 不在 cards 中的点选关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'tap-identify',
      data: {
        cards: [
          { id: 'a', emoji: '🍎', label: '红苹果' },
          { id: 'b', emoji: '🍏', label: '青苹果' },
        ],
        answerCardId: 'x',
      },
    });
    expect(result.success).toBe(false);
  });
});