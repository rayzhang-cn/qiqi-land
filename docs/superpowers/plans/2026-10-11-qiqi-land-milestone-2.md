# 奇奇乐园 · 里程碑 2「古诗乐园」实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 语言岛「诗词小径」上线——孩子自由点选 52 首古诗、整首连播跟读（逐字高亮），听完自动得星。

**Architecture:** 诗是独立内容类型（PoemSchema），不复用 LevelData。新增 `PoemRecital` 跟读屏幕（定时驱动的逐字 karaoke + 播放按钮手势门控 TTS）、`PoemList` 诗单、`App` 增加两个 screen；附带修复 M1 终审遗留（GameEngine 听一听按钮、PNG 图标、全屏 meta）。护眼配色用 CSS 变量落地。

**Tech Stack:** 复用现有 Vite + React 18 + TypeScript + Zustand + Zod + Vitest + Playwright + vite-plugin-pwa。

**设计文档:** `docs/superpowers/specs/2026-10-11-qiqi-land-m2-poems-design.md`

**重要实现说明（相对设计文档的细化）：**
- 逐字高亮采用**定时驱动**（每字 350ms）而非 TTS `onboundary`——后者对中文在 iOS Safari 上不可靠，定时驱动确定性强、可测、任何环境都能动，视觉结果一致。
- 跟读不做「暂停/继续」，仅「▶️ 开始听」（空闲态）与「⏹ 停止」（播放态）两个按钮；重听=重新点开始（从头开始）。

**文件结构总览：**

```
src/content/schema.ts        — 追加 PoemSchema + Poem 类型（Task 1）
src/content/index.ts         — 追加 poems 加载 + getPoems/getPoem（Task 1）
src/content/poems/*.json     — 52 首诗（Task 6）
scripts/validate-content.ts  — 同时校验 levels/ 与 poems/（Task 1）
src/engine/useSpeech.ts      — 追加 cancel 方法（Task 2）
src/templates/poemText.ts    — toChars 拆字工具（Task 3）
src/screens/PoemRecital.tsx  — 跟读屏幕（Task 3）
src/screens/PoemList.tsx     — 诗单（Task 4）
src/App.tsx                  — 加 poem-list/poem-recital（Task 5）
src/screens/WorldMap.tsx     — 语言岛开放 + onOpenIsland 传 domain（Task 5）
src/theme.css                — 诗词样式 + 护眼配色变量（Task 5）
src/engine/GameEngine.tsx    — 移除自动播报、加听一听按钮（Task 7）
public/icons/icon-180.png / icon-512.png — 生成（Task 8）
scripts/generate-icons.mjs   — 图标生成脚本（Task 8）
vite.config.ts / index.html  — manifest lang + PNG 图标 + 全屏 meta（Task 8）
e2e/poem.spec.ts             — 古诗流程冒烟（Task 9）
```

---

### Task 1: PoemSchema 与诗数据加载

**Files:**
- Modify: `src/content/schema.ts`（末尾追加）
- Modify: `src/content/index.ts`（追加加载与查询）
- Modify: `scripts/validate-content.ts`（整体替换，校验两个目录）
- Modify: `src/content/schema.test.ts`（追加 PoemSchema 测试）
- Create: `src/content/poems/.gitkeep`

- [ ] **Step 1: 建立 milestone-2 分支**

```bash
cd /Users/rayzhang/developement/child-learning
git checkout -b milestone-2
```

- [ ] **Step 2: 追加 PoemSchema 到 schema.ts**

在 `src/content/schema.ts` 文件末尾追加：

```ts
export const PoemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  dynasty: z.string().min(1),
  lines: z.array(z.string().min(1)).min(2),
  familiar: z.boolean(),
});

export type Poem = z.infer<typeof PoemSchema>;
```

- [ ] **Step 3: 追加诗加载到 index.ts**

`src/content/index.ts` 第 1 行改为：

```ts
import { LevelSchema, type LevelData, PoemSchema, type Poem } from './schema';
```

在文件末尾追加：

```ts
const poemModules = import.meta.glob('./poems/*.json', { eager: true, import: 'default' });

export const poems: Poem[] = (Object.values(poemModules) as unknown[])
  .map((raw) => {
    const result = PoemSchema.safeParse(raw);
    return result.success ? result.data : null;
  })
  .filter((p): p is Poem => p !== null);

export function getPoems(): Poem[] {
  return poems;
}

export function getPoem(id: string): Poem | undefined {
  return poems.find((p) => p.id === id);
}
```

- [ ] **Step 4: 写失败的 PoemSchema 测试**

`src/content/schema.test.ts` 第 1 行改为：

```ts
import { LevelSchema, PoemSchema } from './schema';
```

在文件末尾追加：

```ts
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
```

Run: `npm test -- schema`
Expected: PASS（现有 6 个 LevelSchema 测试 + 3 个新 PoemSchema 测试 = 9 passed）

- [ ] **Step 5: 替换 validate-content.ts 同时校验两个目录**

`scripts/validate-content.ts` 整体替换为：

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LevelSchema, PoemSchema } from '../src/content/schema';

const root = fileURLToPath(new URL('../src/content/', import.meta.url));
let failed = 0;

const levelsDir = join(root, 'levels');
for (const file of readdirSync(levelsDir).filter((f) => f.endsWith('.json'))) {
  try {
    const raw = JSON.parse(readFileSync(join(levelsDir, file), 'utf-8'));
    const result = LevelSchema.safeParse(raw);
    if (result.success) {
      console.log(`✅ levels/${file}`);
    } else {
      console.error(`❌ levels/${file}`, result.error.issues);
      failed++;
    }
  } catch (e) {
    console.error(`❌ levels/${file} 无法解析 JSON:`, e instanceof Error ? e.message : e);
    failed++;
  }
}

const poemsDir = join(root, 'poems');
if (existsSync(poemsDir)) {
  for (const file of readdirSync(poemsDir).filter((f) => f.endsWith('.json'))) {
    try {
      const raw = JSON.parse(readFileSync(join(poemsDir, file), 'utf-8'));
      const result = PoemSchema.safeParse(raw);
      if (result.success) {
        console.log(`✅ poems/${file}`);
      } else {
        console.error(`❌ poems/${file}`, result.error.issues);
        failed++;
      }
    } catch (e) {
      console.error(`❌ poems/${file} 无法解析 JSON:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`${failed} 个内容文件校验失败`);
  process.exit(1);
}
console.log('全部内容数据校验通过');
```

- [ ] **Step 6: 创建 poems 目录占位**

```bash
mkdir -p src/content/poems
touch src/content/poems/.gitkeep
```

Run: `npm run validate:content`
Expected: 12 个 levels ✅ + 「全部内容数据校验通过」（poems 目录只有 .gitkeep）

- [ ] **Step 7: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: PoemSchema 与诗数据加载"
```

---

### Task 2: useSpeech 增加 cancel

**Files:**
- Modify: `src/engine/useSpeech.ts`
- Modify: `src/engine/useSpeech.test.ts`（追加测试）

- [ ] **Step 1: 写失败的测试**

`src/engine/useSpeech.test.ts` 末尾追加（在 `describe` 内部、最后一个 it 之后）：

```ts
  it('cancel 调用 speechSynthesis.cancel', () => {
    const cancel = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak: vi.fn(), cancel });
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        text: string;
        lang = '';
        rate = 1;
        constructor(t: string) {
          this.text = t;
        }
      },
    );
    const { result } = renderHook(() => useSpeech());
    result.current.cancel();
    expect(cancel).toHaveBeenCalledTimes(1);
  });
```

Run: `npm test -- useSpeech`
Expected: FAIL（`result.current.cancel is not a function`）

- [ ] **Step 2: 实现 cancel**

`src/engine/useSpeech.ts` 整体替换为：

```ts
import { useCallback } from 'react';

export function useSpeech() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [supported],
  );

  const cancel = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
  }, [supported]);

  return { speak, cancel, supported };
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- useSpeech`
Expected: PASS（3 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: useSpeech 增加 cancel（供跟读停止用）"
```

---

### Task 3: 拆字工具与 PoemRecital 跟读屏幕

**Files:**
- Create: `src/templates/poemText.ts`
- Create: `src/templates/poemText.test.ts`
- Create: `src/screens/PoemRecital.tsx`
- Create: `src/screens/PoemRecital.test.tsx`

- [ ] **Step 1: 写失败的 toChars 测试**

`src/templates/poemText.test.ts`：

```ts
import { toChars } from './poemText';

describe('toChars', () => {
  it('按字拆分诗句', () => {
    expect(toChars('床前明月光')).toEqual(['床', '前', '明', '月', '光']);
  });

  it('去除标点后再拆分', () => {
    expect(toChars('敕勒川，阴山下')).toEqual(['敕', '勒', '川', '阴', '山', '下']);
  });
});
```

Run: `npm test -- poemText`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 poemText.ts**

```ts
export function toChars(line: string): string[] {
  return Array.from(line.replace(/[\s，。、；：！？「」『』（）“”‘’]/g, ''));
}
```

- [ ] **Step 3: 运行 toChars 测试确认通过**

Run: `npm test -- poemText`
Expected: PASS（2 passed）

- [ ] **Step 4: 写失败的 PoemRecital 测试**

`src/screens/PoemRecital.test.tsx`：

```tsx
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PoemRecital } from './PoemRecital';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import type { Poem } from '../content/schema';

const { speakMock, cancelMock } = vi.hoisted(() => ({ speakMock: vi.fn(), cancelMock: vi.fn() }));

vi.mock('../engine/useSpeech', () => ({
  useSpeech: () => ({ speak: speakMock, cancel: cancelMock, supported: true }),
}));

const poem: Poem = {
  id: 'poem-test',
  title: '静夜思',
  author: '李白',
  dynasty: '唐',
  lines: ['床前明月光', '疑是地上霜'],
  familiar: true,
};

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  speakMock.mockClear();
  cancelMock.mockClear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '5-6' }],
    activeId: 'p1',
  });
  useProgressStore.setState({ byProfile: {} });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PoemRecital', () => {
  it('挂载时不自动朗读（手势门控）', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    expect(speakMock).not.toHaveBeenCalled();
    expect(screen.getByText('静夜思')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始听' })).toBeInTheDocument();
  });

  it('点击开始听后朗读第一句', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    expect(speakMock).toHaveBeenCalledWith('床前明月光');
  });

  it('逐字推进，播完触发完成并记录星星', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    act(() => {
      vi.advanceTimersByTime(10 * 350);
    });
    expect(screen.getByLabelText('获得星星')).toBeInTheDocument();
    expect(useProgressStore.getState().byProfile['p1']['poem-test']).toMatchObject({ stars: 1 });
  });

  it('停止按钮取消朗读并复位', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '开始听' })).toBeInTheDocument();
  });
});
```

Run: `npm test -- PoemRecital`
Expected: FAIL（模块不存在）

- [ ] **Step 5: 实现 PoemRecital.tsx**

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Poem } from '../content/schema';
import { toChars } from '../templates/poemText';
import { useSpeech } from '../engine/useSpeech';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import { Buddy } from '../components/Buddy';

export const MS_PER_CHAR = 350;

type Status = 'idle' | 'playing' | 'done';

interface CharItem {
  lineIndex: number;
  charIndex: number;
  char: string;
}

export function PoemRecital({ poem, onExit }: { poem: Poem; onExit: () => void }) {
  const { speak, cancel } = useSpeech();
  const activeId = useProfilesStore((s) => s.activeId);
  const avatar = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId)?.avatar ?? '🦖');
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const items = useMemo<CharItem[]>(
    () =>
      poem.lines.flatMap((line, lineIndex) =>
        toChars(line).map((char, charIndex) => ({ lineIndex, charIndex, char })),
      ),
    [poem],
  );

  const [status, setStatus] = useState<Status>('idle');
  const [pos, setPos] = useState(-1);
  const timerRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stopTimer();
    setPos(0);
    setStatus('playing');
    timerRef.current = window.setInterval(() => {
      setPos((prev) => prev + 1);
    }, MS_PER_CHAR);
  }, [stopTimer]);

  const stop = useCallback(() => {
    stopTimer();
    cancel();
    setStatus('idle');
    setPos(-1);
  }, [stopTimer, cancel]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (pos >= items.length) {
      stopTimer();
      setStatus('done');
      if (activeId) recordAttempt(activeId, poem.id, true, 1);
      return;
    }
    if (pos === 0) {
      speak(poem.lines[items[0].lineIndex]);
    } else if (items[pos].lineIndex !== items[pos - 1].lineIndex) {
      speak(poem.lines[items[pos].lineIndex]);
    }
  }, [pos, status, items, poem, speak, stopTimer, activeId, recordAttempt]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  if (status === 'done') {
    return (
      <div className="reward-view">
        <div className="reward-stars" aria-label="获得星星">
          ⭐
        </div>
        <Buddy avatar={avatar} text="背得真好！" />
        <button className="big-button" onClick={onExit}>
          继续
        </button>
      </div>
    );
  }

  const current = pos >= 0 && pos < items.length ? items[pos] : null;

  return (
    <div className="poem-screen">
      <div className="poem-title">
        <h2>{poem.title}</h2>
        <span className="poem-author">
          {poem.author} · {poem.dynasty}
        </span>
      </div>
      <div className="poem-lines">
        {poem.lines.map((line, li) => (
          <div key={li} className="poem-line">
            {toChars(line).map((ch, ci) => (
              <span
                key={ci}
                className={current?.lineIndex === li && current?.charIndex === ci ? 'char char-current' : 'char'}
              >
                {ch}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="poem-controls">
        {status === 'idle' && (
          <button className="poem-play" onClick={start} aria-label="开始听">
            ▶️ 开始听
          </button>
        )}
        {status === 'playing' && (
          <button className="poem-stop" onClick={stop} aria-label="停止">
            ⏹ 停止
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: 运行 PoemRecital 测试确认通过**

Run: `npm test -- PoemRecital`
Expected: PASS（4 passed）

- [ ] **Step 7: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: 拆字工具与 PoemRecital 跟读屏幕（逐字高亮）"
```

---

### Task 4: PoemList 诗单

**Files:**
- Create: `src/screens/PoemList.tsx`
- Create: `src/screens/PoemList.test.tsx`

- [ ] **Step 1: 写失败的测试**

`src/screens/PoemList.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoemList } from './PoemList';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';

vi.mock('../content', () => ({
  getPoems: () => [
    { id: 'p1', title: '静夜思', author: '李白', dynasty: '唐', lines: ['床前明月光', '疑是地上霜'], familiar: false },
    { id: 'p2', title: '梅花', author: '王安石', dynasty: '宋', lines: ['墙角数枝梅', '凌寒独自开'], familiar: true },
  ],
}));

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '5-6' }],
    activeId: 'p1',
  });
  useProgressStore.setState({ byProfile: {} });
});

describe('PoemList', () => {
  it('渲染所有诗并标记已会/新学', () => {
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('静夜思')).toBeInTheDocument();
    expect(screen.getByText('梅花')).toBeInTheDocument();
    expect(screen.getByText('已会')).toBeInTheDocument();
    expect(screen.getByText('新学')).toBeInTheDocument();
  });

  it('已会诗排在前面', () => {
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    const cards = screen.getAllByRole('button').filter((b) => b.className.includes('poem-card'));
    expect(cards[0]).toHaveTextContent('梅花');
    expect(cards[1]).toHaveTextContent('静夜思');
  });

  it('点击诗触发 onSelectPoem', async () => {
    const onSelectPoem = vi.fn();
    render(<PoemList onSelectPoem={onSelectPoem} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText('静夜思'));
    expect(onSelectPoem).toHaveBeenCalledWith('p1');
  });

  it('已完成的诗显示星星', () => {
    useProgressStore.setState({ byProfile: { p1: { p1: { stars: 1, attempts: 1, correct: 1 } } } });
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByLabelText('诗词星星')).toHaveTextContent('⭐');
  });
});
```

Run: `npm test -- PoemList`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 PoemList.tsx**

```tsx
import { getPoems } from '../content';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore, type LevelProgress } from '../stores/progress';

const EMPTY: Record<string, LevelProgress> = {};

interface Props {
  onSelectPoem: (id: string) => void;
  onBack: () => void;
}

export function PoemList({ onSelectPoem, onBack }: Props) {
  const poems = [...getPoems()].sort((a, b) => Number(b.familiar) - Number(a.familiar));
  const activeId = useProfilesStore((s) => s.activeId);
  const progress = useProgressStore((s) => (activeId ? s.byProfile[activeId] ?? EMPTY : EMPTY));

  return (
    <div className="poem-list">
      <button className="back-button" onClick={onBack}>
        ← 返回地图
      </button>
      <h1 className="poem-list-title">诗词小径</h1>
      <p className="poem-list-story">跟着奇奇一起，听一首优美的古诗吧！</p>
      <div className="poem-card-list">
        {poems.map((p) => {
          const stars = progress[p.id]?.stars ?? 0;
          return (
            <button key={p.id} className="poem-card" onClick={() => onSelectPoem(p.id)}>
              <div className="poem-card-main">
                <span className="poem-card-title">{p.title}</span>
                <span className="poem-card-meta">
                  {p.author} · {p.dynasty}
                </span>
              </div>
              <div className="poem-card-right">
                <span className={`poem-badge ${p.familiar ? 'poem-badge-known' : 'poem-badge-new'}`}>
                  {p.familiar ? '已会' : '新学'}
                </span>
                {stars > 0 && (
                  <span className="poem-card-stars" aria-label="诗词星星">
                    {'⭐'.repeat(stars)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- PoemList`
Expected: PASS（4 passed）

- [ ] **Step 4: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 诗词小径诗单 PoemList"
```

---

### Task 5: App 流转、世界地图开放语言岛与护眼样式

**Files:**
- Modify: `src/App.tsx`（整体替换）
- Modify: `src/screens/WorldMap.tsx`（整体替换）
- Modify: `src/theme.css`（末尾追加）

- [ ] **Step 1: 替换 WorldMap.tsx（语言岛开放 + onOpenIsland 传 domain）**

```tsx
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';

const ISLANDS = [
  { domain: 'math', emoji: '🔢', name: '数学山', open: true },
  { domain: 'language', emoji: '🔤', name: '语言岛', open: true },
  { domain: 'science', emoji: '🦕', name: '科学森林', open: false },
  { domain: 'art', emoji: '🎨', name: '艺术城堡', open: false },
] as const;

export function WorldMap({ onOpenIsland }: { onOpenIsland: (domain: string) => void }) {
  const profile = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId));
  const activeId = useProfilesStore((s) => s.activeId);
  const totalStars = useProgressStore((s) => {
    const p = activeId ? s.byProfile[activeId] : undefined;
    return p ? Object.values(p).reduce((sum, l) => sum + l.stars, 0) : 0;
  });

  return (
    <div className="world-map">
      <header className="map-header">
        <span className="profile-avatar">{profile?.avatar}</span>
        <span>{profile?.name}</span>
        <span aria-label="总星星">⭐{totalStars}</span>
      </header>
      <h1 className="app-title">奇奇乐园</h1>
      <div className="island-grid">
        {ISLANDS.map((island) => (
          <button
            key={island.domain}
            className={`island-card ${island.open ? '' : 'island-locked'}`}
            disabled={!island.open}
            onClick={() => island.open && onOpenIsland(island.domain)}
          >
            <span className="island-emoji">{island.emoji}</span>
            <span>{island.name}</span>
            {!island.open && <span className="island-soon">即将开放</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 替换 App.tsx（新增诗词屏幕 + 按 domain 路由）**

```tsx
import { useState } from 'react';
import { ProfileSelect } from './screens/ProfileSelect';
import { WorldMap } from './screens/WorldMap';
import { ChapterView } from './screens/ChapterView';
import { GameEngine } from './engine/GameEngine';
import { PoemList } from './screens/PoemList';
import { PoemRecital } from './screens/PoemRecital';
import { getLevel, getPoem } from './content';

type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'chapter'; chapterId: string }
  | { name: 'game'; levelId: string }
  | { name: 'poem-list' }
  | { name: 'poem-recital'; poemId: string };

const MAP = { name: 'map' } as const;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  const openIsland = (domain: string) => {
    if (domain === 'math') setScreen({ name: 'chapter', chapterId: 'math-ch1' });
    else if (domain === 'language') setScreen({ name: 'poem-list' });
  };

  switch (screen.name) {
    case 'profiles':
      return <ProfileSelect onEnter={() => setScreen(MAP)} />;
    case 'map':
      return <WorldMap onOpenIsland={openIsland} />;
    case 'chapter':
      return (
        <ChapterView
          chapterId={screen.chapterId}
          onPlayLevel={(levelId) => setScreen({ name: 'game', levelId })}
          onBack={() => setScreen(MAP)}
        />
      );
    case 'game': {
      const level = getLevel(screen.levelId);
      if (!level) return <WorldMap onOpenIsland={openIsland} />;
      return (
        <GameEngine
          level={level}
          onExit={() => setScreen({ name: 'chapter', chapterId: level.chapter })}
        />
      );
    }
    case 'poem-list':
      return (
        <PoemList
          onSelectPoem={(poemId) => setScreen({ name: 'poem-recital', poemId })}
          onBack={() => setScreen(MAP)}
        />
      );
    case 'poem-recital': {
      const poem = getPoem(screen.poemId);
      if (!poem) {
        return (
          <PoemList
            onSelectPoem={(poemId) => setScreen({ name: 'poem-recital', poemId })}
            onBack={() => setScreen(MAP)}
          />
        );
      }
      return <PoemRecital poem={poem} onExit={() => setScreen({ name: 'poem-list' })} />;
    }
  }
}
```

- [ ] **Step 3: 追加诗词样式与护眼配色到 theme.css**

在 `src/theme.css` 文件末尾追加：

```css
/* 诗词小径 · 护眼配色 */
:root {
  --poem-bg: #f5f1e8;
  --poem-ink: #3e2723;
  --poem-ink-soft: #8d6e63;
  --poem-highlight: #c8e6c9;
  --poem-button: #ef9a9a;
}

.poem-screen {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
  background: var(--poem-bg);
  min-height: 100vh;
  color: var(--poem-ink);
}

.poem-title h2 {
  font-size: 2rem;
  margin: 8px 0 4px;
}

.poem-author {
  color: var(--poem-ink-soft);
}

.poem-lines {
  margin: 28px 0;
}

.poem-line {
  font-family: serif;
  font-size: 1.9rem;
  line-height: 2.2;
}

.char {
  padding: 0 2px;
  border-radius: 6px;
}

.char-current {
  background: var(--poem-highlight);
}

.poem-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.poem-play {
  background: var(--poem-button);
  color: var(--poem-ink);
  font-size: 1.3rem;
  padding: 12px 28px;
  border-radius: 999px;
}

.poem-stop {
  background: #fff;
  border: 1px solid #e0d5c7;
  color: var(--poem-ink);
  font-size: 1.3rem;
  padding: 12px 28px;
  border-radius: 999px;
}

.poem-list {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
  background: var(--poem-bg);
  min-height: 100vh;
  color: var(--poem-ink);
}

.poem-list-title {
  text-align: center;
  font-size: 2rem;
  color: #ff8a65;
  margin: 8px 0 4px;
}

.poem-list-story {
  text-align: center;
  color: var(--poem-ink-soft);
}

.poem-card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.poem-card {
  background: #fff;
  border-radius: 18px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  text-align: left;
}

.poem-card-title {
  font-size: 1.5rem;
  color: var(--poem-ink);
  display: block;
}

.poem-card-meta {
  color: var(--poem-ink-soft);
  font-size: 0.95rem;
}

.poem-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.poem-badge {
  font-size: 0.85rem;
  border-radius: 999px;
  padding: 2px 10px;
}

.poem-badge-known {
  background: #e8f5e9;
  color: #2e7d32;
}

.poem-badge-new {
  background: #fff3e0;
  color: #ef6c00;
}
```

- [ ] **Step 4: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS（App 默认屏幕测试仍通过）

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: App 诗词流转、语言岛开放与护眼样式"
```

---

### Task 6: 52 首诗内容

**Files:**
- Create: `src/content/poems/poem-01.json` … `poem-52.json`（共 52 个文件）

poem-01 到 poem-32 为 `familiar: true`（已会），poem-33 到 poem-52 为 `familiar: false`（新学）。每个文件结构相同，仅内容不同。

- [ ] **Step 1: 创建 32 首已会诗（familiar: true）**

逐个创建以下 32 个文件（内容如下，逐字抄写）：

`src/content/poems/poem-01.json`：

```json
{
  "id": "poem-01",
  "title": "梅花",
  "author": "王安石",
  "dynasty": "宋",
  "lines": ["墙角数枝梅", "凌寒独自开", "遥知不是雪", "为有暗香来"],
  "familiar": true
}
```

`src/content/poems/poem-02.json`：

```json
{
  "id": "poem-02",
  "title": "鸟鸣涧",
  "author": "王维",
  "dynasty": "唐",
  "lines": ["人闲桂花落", "夜静春山空", "月出惊山鸟", "时鸣春涧中"],
  "familiar": true
}
```

`src/content/poems/poem-03.json`：

```json
{
  "id": "poem-03",
  "title": "泊船瓜洲",
  "author": "王安石",
  "dynasty": "宋",
  "lines": ["京口瓜洲一水间", "钟山只隔数重山", "春风又绿江南岸", "明月何时照我还"],
  "familiar": true
}
```

`src/content/poems/poem-04.json`：

```json
{
  "id": "poem-04",
  "title": "题西林壁",
  "author": "苏轼",
  "dynasty": "宋",
  "lines": ["横看成岭侧成峰", "远近高低各不同", "不识庐山真面目", "只缘身在此山中"],
  "familiar": true
}
```

`src/content/poems/poem-05.json`：

```json
{
  "id": "poem-05",
  "title": "问刘十九",
  "author": "白居易",
  "dynasty": "唐",
  "lines": ["绿蚁新醅酒", "红泥小火炉", "晚来天欲雪", "能饮一杯无"],
  "familiar": true
}
```

`src/content/poems/poem-06.json`：

```json
{
  "id": "poem-06",
  "title": "滁州西涧",
  "author": "韦应物",
  "dynasty": "唐",
  "lines": ["独怜幽草涧边生", "上有黄鹂深树鸣", "春潮带雨晚来急", "野渡无人舟自横"],
  "familiar": true
}
```

`src/content/poems/poem-07.json`：

```json
{
  "id": "poem-07",
  "title": "秋夕",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["银烛秋光冷画屏", "轻罗小扇扑流萤", "天阶夜色凉如水", "坐看牵牛织女星"],
  "familiar": true
}
```

`src/content/poems/poem-08.json`：

```json
{
  "id": "poem-08",
  "title": "出塞",
  "author": "王昌龄",
  "dynasty": "唐",
  "lines": ["秦时明月汉时关", "万里长征人未还", "但使龙城飞将在", "不教胡马度阴山"],
  "familiar": true
}
```

`src/content/poems/poem-09.json`：

```json
{
  "id": "poem-09",
  "title": "望洞庭",
  "author": "刘禹锡",
  "dynasty": "唐",
  "lines": ["湖光秋月两相和", "潭面无风镜未磨", "遥望洞庭山水翠", "白银盘里一青螺"],
  "familiar": true
}
```

`src/content/poems/poem-10.json`：

```json
{
  "id": "poem-10",
  "title": "七步诗",
  "author": "曹植",
  "dynasty": "三国·魏",
  "lines": ["煮豆燃豆萁", "豆在釜中泣", "本是同根生", "相煎何太急"],
  "familiar": true
}
```

`src/content/poems/poem-11.json`：

```json
{
  "id": "poem-11",
  "title": "春夜喜雨",
  "author": "杜甫",
  "dynasty": "唐",
  "lines": ["好雨知时节", "当春乃发生", "随风潜入夜", "润物细无声", "野径云俱黑", "江船火独明", "晓看红湿处", "花重锦官城"],
  "familiar": true
}
```

`src/content/poems/poem-12.json`：

```json
{
  "id": "poem-12",
  "title": "江南春",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["千里莺啼绿映红", "水村山郭酒旗风", "南朝四百八十寺", "多少楼台烟雨中"],
  "familiar": true
}
```

`src/content/poems/poem-13.json`：

```json
{
  "id": "poem-13",
  "title": "惠崇春江晚景",
  "author": "苏轼",
  "dynasty": "宋",
  "lines": ["竹外桃花三两枝", "春江水暖鸭先知", "蒌蒿满地芦芽短", "正是河豚欲上时"],
  "familiar": true
}
```

`src/content/poems/poem-14.json`：

```json
{
  "id": "poem-14",
  "title": "凉州词",
  "author": "王之涣",
  "dynasty": "唐",
  "lines": ["黄河远上白云间", "一片孤城万仞山", "羌笛何须怨杨柳", "春风不度玉门关"],
  "familiar": true
}
```

`src/content/poems/poem-15.json`：

```json
{
  "id": "poem-15",
  "title": "乡村四月",
  "author": "翁卷",
  "dynasty": "宋",
  "lines": ["绿遍山原白满川", "子规声里雨如烟", "乡村四月闲人少", "才了蚕桑又插田"],
  "familiar": true
}
```

`src/content/poems/poem-16.json`：

```json
{
  "id": "poem-16",
  "title": "大林寺桃花",
  "author": "白居易",
  "dynasty": "唐",
  "lines": ["人间四月芳菲尽", "山寺桃花始盛开", "长恨春归无觅处", "不知转入此中来"],
  "familiar": true
}
```

`src/content/poems/poem-17.json`：

```json
{
  "id": "poem-17",
  "title": "饮湖上初晴后雨",
  "author": "苏轼",
  "dynasty": "宋",
  "lines": ["水光潋滟晴方好", "山色空蒙雨亦奇", "欲把西湖比西子", "淡妆浓抹总相宜"],
  "familiar": true
}
```

`src/content/poems/poem-18.json`：

```json
{
  "id": "poem-18",
  "title": "观书有感",
  "author": "朱熹",
  "dynasty": "宋",
  "lines": ["半亩方塘一鉴开", "天光云影共徘徊", "问渠那得清如许", "为有源头活水来"],
  "familiar": true
}
```

`src/content/poems/poem-19.json`：

```json
{
  "id": "poem-19",
  "title": "金缕衣",
  "author": "佚名",
  "dynasty": "唐",
  "lines": ["劝君莫惜金缕衣", "劝君惜取少年时", "花开堪折直须折", "莫待无花空折枝"],
  "familiar": true
}
```

`src/content/poems/poem-20.json`：

```json
{
  "id": "poem-20",
  "title": "浪淘沙",
  "author": "刘禹锡",
  "dynasty": "唐",
  "lines": ["九曲黄河万里沙", "浪淘风簸自天涯", "如今直上银河去", "同到牵牛织女家"],
  "familiar": true
}
```

`src/content/poems/poem-21.json`：

```json
{
  "id": "poem-21",
  "title": "登飞来峰",
  "author": "王安石",
  "dynasty": "宋",
  "lines": ["飞来山上千寻塔", "闻说鸡鸣见日升", "不畏浮云遮望眼", "自缘身在最高层"],
  "familiar": true
}
```

`src/content/poems/poem-22.json`：

```json
{
  "id": "poem-22",
  "title": "竹石",
  "author": "郑燮",
  "dynasty": "清",
  "lines": ["咬定青山不放松", "立根原在破岩中", "千磨万击还坚劲", "任尔东西南北风"],
  "familiar": true
}
```

`src/content/poems/poem-23.json`：

```json
{
  "id": "poem-23",
  "title": "三衢道中",
  "author": "曾几",
  "dynasty": "宋",
  "lines": ["梅子黄时日日晴", "小溪泛尽却山行", "绿阴不减来时路", "添得黄鹂四五声"],
  "familiar": true
}
```

`src/content/poems/poem-24.json`：

```json
{
  "id": "poem-24",
  "title": "过华清宫",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["长安回望绣成堆", "山顶千门次第开", "一骑红尘妃子笑", "无人知是荔枝来"],
  "familiar": true
}
```

`src/content/poems/poem-25.json`：

```json
{
  "id": "poem-25",
  "title": "约客",
  "author": "赵师秀",
  "dynasty": "宋",
  "lines": ["黄梅时节家家雨", "青草池塘处处蛙", "有约不来过夜半", "闲敲棋子落灯花"],
  "familiar": true
}
```

`src/content/poems/poem-26.json`：

```json
{
  "id": "poem-26",
  "title": "敕勒歌",
  "author": "北朝民歌",
  "dynasty": "南北朝",
  "lines": ["敕勒川", "阴山下", "天似穹庐", "笼盖四野", "天苍苍", "野茫茫", "风吹草低见牛羊"],
  "familiar": true
}
```

`src/content/poems/poem-27.json`：

```json
{
  "id": "poem-27",
  "title": "赠花卿",
  "author": "杜甫",
  "dynasty": "唐",
  "lines": ["锦城丝管日纷纷", "半入江风半入云", "此曲只应天上有", "人间能得几回闻"],
  "familiar": true
}
```

`src/content/poems/poem-28.json`：

```json
{
  "id": "poem-28",
  "title": "钱塘湖春行",
  "author": "白居易",
  "dynasty": "唐",
  "lines": ["孤山寺北贾亭西", "水面初平云脚低", "几处早莺争暖树", "谁家新燕啄春泥", "乱花渐欲迷人眼", "浅草才能没马蹄", "最爱湖东行不足", "绿杨阴里白沙堤"],
  "familiar": true
}
```

`src/content/poems/poem-29.json`：

```json
{
  "id": "poem-29",
  "title": "长歌行",
  "author": "汉乐府",
  "dynasty": "汉",
  "lines": ["青青园中葵", "朝露待日晞", "阳春布德泽", "万物生光辉", "常恐秋节至", "焜黄华叶衰", "百川东到海", "何时复西归", "少壮不努力", "老大徒伤悲"],
  "familiar": true
}
```

`src/content/poems/poem-30.json`：

```json
{
  "id": "poem-30",
  "title": "商山早行",
  "author": "温庭筠",
  "dynasty": "唐",
  "lines": ["晨起动征铎", "客行悲故乡", "鸡声茅店月", "人迹板桥霜", "槲叶落山路", "枳花明驿墙", "因思杜陵梦", "凫雁满回塘"],
  "familiar": true
}
```

`src/content/poems/poem-31.json`：

```json
{
  "id": "poem-31",
  "title": "泊秦淮",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["烟笼寒水月笼沙", "夜泊秦淮近酒家", "商女不知亡国恨", "隔江犹唱后庭花"],
  "familiar": true
}
```

`src/content/poems/poem-32.json`：

```json
{
  "id": "poem-32",
  "title": "赤壁",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["折戟沉沙铁未销", "自将磨洗认前朝", "东风不与周郎便", "铜雀春深锁二乔"],
  "familiar": true
}
```

- [ ] **Step 2: 创建 20 首新学诗（familiar: false）**

`src/content/poems/poem-33.json`：

```json
{
  "id": "poem-33",
  "title": "咏鹅",
  "author": "骆宾王",
  "dynasty": "唐",
  "lines": ["鹅鹅鹅", "曲项向天歌", "白毛浮绿水", "红掌拨清波"],
  "familiar": false
}
```

`src/content/poems/poem-34.json`：

```json
{
  "id": "poem-34",
  "title": "静夜思",
  "author": "李白",
  "dynasty": "唐",
  "lines": ["床前明月光", "疑是地上霜", "举头望明月", "低头思故乡"],
  "familiar": false
}
```

`src/content/poems/poem-35.json`：

```json
{
  "id": "poem-35",
  "title": "春晓",
  "author": "孟浩然",
  "dynasty": "唐",
  "lines": ["春眠不觉晓", "处处闻啼鸟", "夜来风雨声", "花落知多少"],
  "familiar": false
}
```

`src/content/poems/poem-36.json`：

```json
{
  "id": "poem-36",
  "title": "悯农",
  "author": "李绅",
  "dynasty": "唐",
  "lines": ["锄禾日当午", "汗滴禾下土", "谁知盘中餐", "粒粒皆辛苦"],
  "familiar": false
}
```

`src/content/poems/poem-37.json`：

```json
{
  "id": "poem-37",
  "title": "登鹳雀楼",
  "author": "王之涣",
  "dynasty": "唐",
  "lines": ["白日依山尽", "黄河入海流", "欲穷千里目", "更上一层楼"],
  "familiar": false
}
```

`src/content/poems/poem-38.json`：

```json
{
  "id": "poem-38",
  "title": "相思",
  "author": "王维",
  "dynasty": "唐",
  "lines": ["红豆生南国", "春来发几枝", "愿君多采撷", "此物最相思"],
  "familiar": false
}
```

`src/content/poems/poem-39.json`：

```json
{
  "id": "poem-39",
  "title": "江雪",
  "author": "柳宗元",
  "dynasty": "唐",
  "lines": ["千山鸟飞绝", "万径人踪灭", "孤舟蓑笠翁", "独钓寒江雪"],
  "familiar": false
}
```

`src/content/poems/poem-40.json`：

```json
{
  "id": "poem-40",
  "title": "望庐山瀑布",
  "author": "李白",
  "dynasty": "唐",
  "lines": ["日照香炉生紫烟", "遥看瀑布挂前川", "飞流直下三千尺", "疑是银河落九天"],
  "familiar": false
}
```

`src/content/poems/poem-41.json`：

```json
{
  "id": "poem-41",
  "title": "早发白帝城",
  "author": "李白",
  "dynasty": "唐",
  "lines": ["朝辞白帝彩云间", "千里江陵一日还", "两岸猿声啼不住", "轻舟已过万重山"],
  "familiar": false
}
```

`src/content/poems/poem-42.json`：

```json
{
  "id": "poem-42",
  "title": "赋得古原草送别",
  "author": "白居易",
  "dynasty": "唐",
  "lines": ["离离原上草", "一岁一枯荣", "野火烧不尽", "春风吹又生", "远芳侵古道", "晴翠接荒城", "又送王孙去", "萋萋满别情"],
  "familiar": false
}
```

`src/content/poems/poem-43.json`：

```json
{
  "id": "poem-43",
  "title": "赠汪伦",
  "author": "李白",
  "dynasty": "唐",
  "lines": ["李白乘舟将欲行", "忽闻岸上踏歌声", "桃花潭水深千尺", "不及汪伦送我情"],
  "familiar": false
}
```

`src/content/poems/poem-44.json`：

```json
{
  "id": "poem-44",
  "title": "回乡偶书",
  "author": "贺知章",
  "dynasty": "唐",
  "lines": ["少小离家老大回", "乡音无改鬓毛衰", "儿童相见不相识", "笑问客从何处来"],
  "familiar": false
}
```

`src/content/poems/poem-45.json`：

```json
{
  "id": "poem-45",
  "title": "咏柳",
  "author": "贺知章",
  "dynasty": "唐",
  "lines": ["碧玉妆成一树高", "万条垂下绿丝绦", "不知细叶谁裁出", "二月春风似剪刀"],
  "familiar": false
}
```

`src/content/poems/poem-46.json`：

```json
{
  "id": "poem-46",
  "title": "清明",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["清明时节雨纷纷", "路上行人欲断魂", "借问酒家何处有", "牧童遥指杏花村"],
  "familiar": false
}
```

`src/content/poems/poem-47.json`：

```json
{
  "id": "poem-47",
  "title": "山行",
  "author": "杜牧",
  "dynasty": "唐",
  "lines": ["远上寒山石径斜", "白云生处有人家", "停车坐爱枫林晚", "霜叶红于二月花"],
  "familiar": false
}
```

`src/content/poems/poem-48.json`：

```json
{
  "id": "poem-48",
  "title": "枫桥夜泊",
  "author": "张继",
  "dynasty": "唐",
  "lines": ["月落乌啼霜满天", "江枫渔火对愁眠", "姑苏城外寒山寺", "夜半钟声到客船"],
  "familiar": false
}
```

`src/content/poems/poem-49.json`：

```json
{
  "id": "poem-49",
  "title": "游子吟",
  "author": "孟郊",
  "dynasty": "唐",
  "lines": ["慈母手中线", "游子身上衣", "临行密密缝", "意恐迟迟归", "谁言寸草心", "报得三春晖"],
  "familiar": false
}
```

`src/content/poems/poem-50.json`：

```json
{
  "id": "poem-50",
  "title": "小池",
  "author": "杨万里",
  "dynasty": "宋",
  "lines": ["泉眼无声惜细流", "树阴照水爱晴柔", "小荷才露尖尖角", "早有蜻蜓立上头"],
  "familiar": false
}
```

`src/content/poems/poem-51.json`：

```json
{
  "id": "poem-51",
  "title": "所见",
  "author": "袁枚",
  "dynasty": "清",
  "lines": ["牧童骑黄牛", "歌声振林樾", "意欲捕鸣蝉", "忽然闭口立"],
  "familiar": false
}
```

`src/content/poems/poem-52.json`：

```json
{
  "id": "poem-52",
  "title": "绝句",
  "author": "杜甫",
  "dynasty": "唐",
  "lines": ["两个黄鹂鸣翠柳", "一行白鹭上青天", "窗含西岭千秋雪", "门泊东吴万里船"],
  "familiar": false
}
```

- [ ] **Step 3: 运行内容校验**

Run: `npm run validate:content`
Expected: 12 个 levels ✅ + 52 个 poems ✅，「全部内容数据校验通过」

- [ ] **Step 4: 运行全部测试确认无回归**

Run: `npm test`
Expected: 全部 PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "content: 诗词小径 52 首诗（32 已会 + 20 新学）"
```

---

### Task 7: GameEngine 听一听按钮（修复 M1 终审 #3）

**Files:**
- Modify: `src/engine/GameEngine.tsx`
- Modify: `src/engine/GameEngine.test.tsx`（整体替换）

- [ ] **Step 1: 替换 GameEngine.test.tsx（hoisted mock + 新增听一听测试）**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameEngine } from './GameEngine';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import type { LevelData } from '../content/schema';

const { speakMock } = vi.hoisted(() => ({ speakMock: vi.fn() }));

vi.mock('./useSpeech', () => ({
  useSpeech: () => ({ speak: speakMock, cancel: vi.fn(), supported: true }),
}));

const level: LevelData = {
  id: 'l1',
  chapter: 'math-ch1',
  order: 1,
  domain: 'math',
  ageBand: '3-4',
  template: 'count',
  voicePrompt: '数一数，有几个苹果？',
  storyLine: '欢迎来到数数谷！',
  reward: { stars: 2 },
  data: { objects: [{ emoji: '🍎', count: 3 }], choices: [2, 3, 4], answer: 3 },
};

beforeEach(() => {
  localStorage.clear();
  speakMock.mockClear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '3-4' }],
    activeId: 'p1',
  });
  useProgressStore.setState({ byProfile: {} });
});

describe('GameEngine', () => {
  it('显示剧情台词与题目语音文字', () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    expect(screen.getByText('欢迎来到数数谷！')).toBeInTheDocument();
    expect(screen.getByText('数一数，有几个苹果？')).toBeInTheDocument();
  });

  it('挂载时不自动朗读，点击听一听才朗读', async () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    expect(speakMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: '听一听' }));
    expect(speakMock).toHaveBeenCalledWith('欢迎来到数数谷！，数一数，有几个苹果？');
  });

  it('答对后进入奖励页并记录星星', async () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByLabelText('获得星星')).toHaveTextContent('⭐⭐');
    expect(useProgressStore.getState().byProfile['p1']['l1']).toMatchObject({ stars: 2, correct: 1 });
  });

  it('答错不得星，可继续作答', async () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.queryByLabelText('获得星星')).not.toBeInTheDocument();
    expect(useProgressStore.getState().byProfile['p1']['l1']).toMatchObject({ stars: 0, attempts: 1 });
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByLabelText('获得星星')).toBeInTheDocument();
  });

  it('奖励页点击「继续」触发 onExit', async () => {
    const onExit = vi.fn();
    render(<GameEngine level={level} onExit={onExit} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: '继续' }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
```

Run: `npm test -- GameEngine`
Expected: FAIL（现有实现挂载时自动 speak，新测试「挂载时不自动朗读」失败）

- [ ] **Step 2: 修改 GameEngine.tsx（移除自动播报、加听一听按钮）**

`src/engine/GameEngine.tsx` 整体替换为：

```tsx
import { useState } from 'react';
import type { LevelData } from '../content/schema';
import { useSpeech } from './useSpeech';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import { TapToIdentify } from '../templates/TapToIdentify';
import { CountingGame } from '../templates/CountingGame';
import { Buddy } from '../components/Buddy';

const ENCOURAGEMENTS = ['没关系，再试一次！', '加油，你可以的！', '仔细想想，马上就想到了！'];

export function GameEngine({ level, onExit }: { level: LevelData; onExit: () => void }) {
  const { speak } = useSpeech();
  const [phase, setPhase] = useState<'playing' | 'reward'>('playing');
  const activeId = useProfilesStore((s) => s.activeId);
  const avatar = useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId)?.avatar ?? '🦖');
  const recordAttempt = useProgressStore((s) => s.recordAttempt);

  const speakPrompt = () => {
    speak(level.storyLine ? `${level.storyLine}，${level.voicePrompt}` : level.voicePrompt);
  };

  const handleCorrect = () => {
    if (activeId) recordAttempt(activeId, level.id, true, level.reward.stars);
    speak('太棒了！');
    setPhase('reward');
  };

  const handleMistake = () => {
    if (activeId) recordAttempt(activeId, level.id, false, 0);
    speak(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
  };

  if (phase === 'reward') {
    return (
      <div className="reward-view">
        <div className="reward-stars" aria-label="获得星星">
          {'⭐'.repeat(level.reward.stars)}
        </div>
        <Buddy avatar={avatar} text="太棒了！" />
        <button className="big-button" onClick={onExit}>
          继续
        </button>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <Buddy avatar={avatar} text={level.storyLine ?? ''} />
      <p className="voice-prompt">{level.voicePrompt}</p>
      <button className="listen-button" onClick={speakPrompt} aria-label="听一听">
        🔊 听一听
      </button>
      {level.template === 'tap-identify' ? (
        <TapToIdentify data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      ) : (
        <CountingGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      )}
    </div>
  );
}
```

在 `src/theme.css` 末尾追加 `.listen-button` 样式：

```css
.listen-button {
  background: #fff;
  border: 2px solid #ffcc80;
  color: #5d4037;
  font-size: 1.1rem;
  padding: 8px 20px;
  border-radius: 999px;
  margin-bottom: 16px;
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- GameEngine`
Expected: PASS（5 passed）

- [ ] **Step 4: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: GameEngine 听一听按钮（手势门控语音，修复 M1 终审 #3）"
```

---

### Task 8: PWA 打磨（PNG 图标 + 全屏 meta + manifest lang）

**Files:**
- Create: `scripts/generate-icons.mjs`
- Create: `public/icons/icon-180.png`、`public/icons/icon-512.png`（脚本生成）
- Modify: `vite.config.ts`（manifest icons + lang）
- Modify: `index.html`（apple-touch-icon + 全屏 meta）

- [ ] **Step 1: 创建图标生成脚本 scripts/generate-icons.mjs**

```js
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function roundedSquarePng(size, radius, color) {
  const { r, g, b } = color;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  let o = 0;
  for (let y = 0; y < size; y++) {
    raw[o++] = 0;
    for (let x = 0; x < size; x++) {
      const dx = Math.max(radius - x, x - (size - 1 - radius), 0);
      const dy = Math.max(radius - y, y - (size - 1 - radius), 0);
      const inside = dx * dx + dy * dy <= radius * radius;
      if (inside) {
        raw[o++] = r;
        raw[o++] = g;
        raw[o++] = b;
        raw[o++] = 255;
      } else {
        raw[o++] = 0;
        raw[o++] = 0;
        raw[o++] = 0;
        raw[o++] = 0;
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const ORANGE = { r: 0xff, g: 0xb7, b: 0x4d };
writeFileSync('public/icons/icon-180.png', roundedSquarePng(180, 40, ORANGE));
writeFileSync('public/icons/icon-512.png', roundedSquarePng(512, 110, ORANGE));
console.log('图标已生成: icon-180.png, icon-512.png');
```

- [ ] **Step 2: 运行脚本生成 PNG 图标**

Run: `node scripts/generate-icons.mjs`
Expected: 输出「图标已生成」

Run: `file public/icons/icon-180.png public/icons/icon-512.png`
Expected: 均显示 `PNG image data, 180 x 180` / `512 x 512, 8-bit/color RGBA`

- [ ] **Step 3: 替换 vite.config.ts 的 manifest 配置**

将 `vite.config.ts` 中的 `manifest: { ... }` 块替换为：

```ts
      manifest: {
        name: '奇奇乐园',
        short_name: '奇奇乐园',
        display: 'standalone',
        background_color: '#FFF8E7',
        theme_color: '#FFB74D',
        lang: 'zh-CN',
        icons: [
          { src: 'icons/icon-180.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
```

- [ ] **Step 4: 更新 index.html**

将 `<head>` 内容改为（在 theme-color 后加全屏 meta，apple-touch-icon 指向 PNG）：

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#FFB74D" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <link rel="apple-touch-icon" href="icons/icon-180.png" />
    <title>奇奇乐园</title>
  </head>
```

- [ ] **Step 5: 构建验证**

Run: `npm run build`
Expected: 构建成功；`cat dist/manifest.webmanifest` 显示 `"lang":"zh-CN"` 且 icons 含 180x180/512x512 PNG

- [ ] **Step 6: 运行全部测试确认无回归**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: PNG 图标与全屏 meta（PWA 打磨）"
```

---

### Task 9: 古诗流程端到端冒烟

**Files:**
- Create: `e2e/poem.spec.ts`

- [ ] **Step 1: 创建 e2e/poem.spec.ts**

```ts
import { test, expect } from '@playwright/test';

test('进语言岛 → 诗词小径 → 听诗跟读 → 得星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /语言岛/ }).click();
  await page.getByRole('button', { name: /静夜思/ }).first().click();
  await page.getByRole('button', { name: '开始听' }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 20000 });
});
```

- [ ] **Step 2: 运行端到端测试**

Run: `npm run e2e`
Expected: 2 passed（原有数学冒烟 + 新古诗冒烟）

- [ ] **Step 3: 确认单元测试不受影响**

Run: `npm test`
Expected: 全部 PASS（vitest 已排除 e2e/）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: 古诗流程端到端冒烟"
```

---

## 里程碑 2 完成标准

- [ ] `npm test`、`npm run e2e`、`npm run validate:content`、`npm run typecheck`、`npm run build` 全部通过
- [ ] iPad Safari 打开 dev 服务器：创建档案 → 语言岛 → 诗词小径 → 点一首诗 → 开始听 → 逐字高亮 → 听完得星
- [ ] 诗单显示 52 首，已会/新学正确标记，已会诗排前
- [ ] 护眼配色生效（柔和米白底 + 深棕字 + 低饱和高亮）
- [ ] 数学关卡有「听一听」按钮（语音不再自动播报）
