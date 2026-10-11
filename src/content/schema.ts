import { z } from 'zod';

const LevelBase = z.object({
  id: z.string().min(1),
  chapter: z.string().min(1),
  order: z.number().int().positive(),
  domain: z.enum(['language', 'math', 'science', 'art']),
  ageBand: z.enum(['3-4', '5-6']),
  voicePrompt: z.string().min(1),
  storyLine: z.string().optional(),
  reward: z.object({ stars: z.number().int().min(1).max(3) }),
});

export const LevelSchema = z.discriminatedUnion('template', [
  LevelBase.extend({
    template: z.literal('tap-identify'),
    data: z.object({
      cards: z
        .array(z.object({ id: z.string(), emoji: z.string(), label: z.string() }))
        .min(2)
        .max(4),
      answerCardId: z.string(),
    }),
  }),
  LevelBase.extend({
    template: z.literal('count'),
    data: z.object({
      objects: z.array(z.object({ emoji: z.string(), count: z.number().int().positive() })).min(1),
      choices: z.array(z.number().int().positive()).min(2).max(4),
      answer: z.number().int().positive(),
    }),
  }),
]).superRefine((level, ctx) => {
  if (level.template === 'count' && !level.data.choices.includes(level.data.answer)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'answer 必须包含在 choices 中',
      path: ['data', 'answer'],
    });
  }
  if (
    level.template === 'tap-identify' &&
    !level.data.cards.some((c) => c.id === level.data.answerCardId)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'answerCardId 必须是 cards 中某个卡片的 id',
      path: ['data', 'answerCardId'],
    });
  }
});

export type LevelData = z.infer<typeof LevelSchema>;
export type TapIdentifyData = Extract<LevelData, { template: 'tap-identify' }>['data'];
export type CountData = Extract<LevelData, { template: 'count' }>['data'];