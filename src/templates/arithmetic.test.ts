import { generateProblem, generateChoices } from './arithmetic';

describe('generateProblem', () => {
  it('add：a+b=answer 且 answer≤maxResult', () => {
    const p = generateProblem({ op: 'add', maxResult: 10 }, () => 0);
    expect(p.a + p.b).toBe(p.answer);
    expect(p.answer).toBeLessThanOrEqual(10);
  });

  it('sub：a-b=answer 且 answer≥0', () => {
    const p = generateProblem({ op: 'sub', maxResult: 10 }, () => 0);
    expect(p.a - p.b).toBe(p.answer);
    expect(p.answer).toBeGreaterThanOrEqual(0);
  });

  it('mixed 产出 add 或 sub 之一', () => {
    const p = generateProblem({ op: 'mixed', maxResult: 10 }, () => 0);
    expect(['add', 'sub']).toContain(p.op);
  });
});

describe('generateChoices', () => {
  it('包含正确答案、长度 3、唯一、范围合法', () => {
    const choices = generateChoices(8, 10, () => 0);
    expect(choices).toHaveLength(3);
    expect(new Set(choices).size).toBe(3);
    expect(choices).toContain(8);
    choices.forEach((c) => expect(c).toBeGreaterThanOrEqual(0));
    choices.forEach((c) => expect(c).toBeLessThanOrEqual(10));
  });
});
