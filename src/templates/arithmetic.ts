export type ArithmeticOp = 'add' | 'sub' | 'mixed';

export interface ArithmeticConfig {
  op: ArithmeticOp;
  maxResult: number;
}

export interface Problem {
  a: number;
  b: number;
  op: 'add' | 'sub';
  answer: number;
  text: string;
}

function randInt(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function generateProblem(config: ArithmeticConfig, random: () => number = Math.random): Problem {
  const op: 'add' | 'sub' = config.op === 'mixed' ? (random() < 0.5 ? 'add' : 'sub') : config.op;
  const max = config.maxResult;
  if (op === 'add') {
    const a = randInt(1, max - 1, random);
    const b = randInt(1, max - a, random);
    return { a, b, op, answer: a + b, text: `${a} + ${b}` };
  }
  const a = randInt(1, max, random);
  const b = randInt(0, a, random);
  return { a, b, op, answer: a - b, text: `${a} - ${b}` };
}

export function generateChoices(answer: number, max: number, random: () => number = Math.random): number[] {
  const choices = new Set<number>([answer]);
  let guard = 0;
  while (choices.size < 3 && guard < 100) {
    const delta = randInt(1, 3, random);
    const candidate = random() < 0.5 ? answer - delta : answer + delta;
    if (candidate >= 0 && candidate <= max && candidate !== answer) {
      choices.add(candidate);
    }
    guard++;
  }
  let fallback = 0;
  while (choices.size < 3) {
    if (!choices.has(fallback)) choices.add(fallback);
    fallback++;
  }
  return shuffle([...choices], random);
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
