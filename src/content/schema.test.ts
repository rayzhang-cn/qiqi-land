import { LevelSchema, PoemSchema } from './schema';

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

describe('LevelSchema arithmetic', () => {
  it('接受合法的算术关卡（choice）', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'arithmetic',
      mode: 'choice',
      data: { op: 'add', maxResult: 10, problemCount: 5 },
    });
    expect(result.success).toBe(true);
  });

  it('拒绝非法 mode', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'arithmetic',
      mode: 'typo',
      data: { op: 'add', maxResult: 10, problemCount: 5 },
    });
    expect(result.success).toBe(false);
  });

  it('拒绝 maxResult 超过 30', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'arithmetic',
      mode: 'fill',
      data: { op: 'add', maxResult: 31, problemCount: 5 },
    });
    expect(result.success).toBe(false);
  });

  it('拒绝 maxResult 小于 2', () => {
    const result = LevelSchema.safeParse({
      ...base,
      template: 'arithmetic',
      mode: 'fill',
      data: { op: 'add', maxResult: 1, problemCount: 5 },
    });
    expect(result.success).toBe(false);
  });
});

describe('LevelSchema science/art', () => {
  it('接受合法的分类关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      domain: 'science',
      template: 'classify',
      data: {
        buckets: [
          { id: 'fly', label: '会飞', emoji: '☁️' },
          { id: 'water', label: '水里', emoji: '🌊' },
        ],
        items: [
          { id: 'bird', emoji: '🐦', label: '小鸟', bucketId: 'fly' },
          { id: 'fish', emoji: '🐟', label: '鱼', bucketId: 'water' },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it('拒绝 bucketId 不在 buckets 中的分类关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      domain: 'science',
      template: 'classify',
      data: {
        buckets: [{ id: 'fly', label: '会飞', emoji: '☁️' }],
        items: [{ id: 'bird', emoji: '🐦', label: '小鸟', bucketId: 'nope' }],
      },
    });
    expect(result.success).toBe(false);
  });

  it('接受合法的涂色关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      domain: 'art',
      template: 'coloring',
      data: { palette: ['#e53935', '#43a047', '#1e88e5'] },
    });
    expect(result.success).toBe(true);
  });

  it('接受合法的音乐关卡', () => {
    const result = LevelSchema.safeParse({
      ...base,
      domain: 'art',
      template: 'music',
      data: {
        notes: [
          { id: 'cat', emoji: '🐱', tone: 262 },
          { id: 'dog', emoji: '🐶', tone: 330 },
        ],
        rounds: 3,
        startLength: 1,
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('PoemSchema', () => {
  it('接受合法的诗', () => {
    const result = PoemSchema.safeParse({
      id: 'poem-01',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      lines: ['床前明月光', '疑是地上霜'],
      familiar: true,
    });
    expect(result.success).toBe(true);
  });

  it('拒绝少于两句的诗', () => {
    const result = PoemSchema.safeParse({
      id: 'poem-01',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      lines: ['床前明月光'],
      familiar: true,
    });
    expect(result.success).toBe(false);
  });

  it('拒绝缺少 familiar 的诗', () => {
    const result = PoemSchema.safeParse({
      id: 'poem-01',
      title: '静夜思',
      author: '李白',
      dynasty: '唐',
      lines: ['床前明月光', '疑是地上霜'],
    });
    expect(result.success).toBe(false);
  });
});