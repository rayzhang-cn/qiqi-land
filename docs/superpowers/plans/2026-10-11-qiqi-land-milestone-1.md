# 奇奇乐园 · 里程碑 1（可玩骨架）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建 PWA 骨架，实现档案选择 → 世界地图 → 数学山第一章（12 关）→ 玩游戏 → 得星星的完整可玩闭环。

**Architecture:** 游戏模板引擎 + JSON 数据驱动内容。React 组件按「屏幕 / 引擎 / 模板 / 数据」分层；进度与档案存 localStorage（zustand persist），IndexedDB 待里程碑 4 引入（学习记录查询需求出现时）。

**Tech Stack:** Vite + React 18 + TypeScript + Zustand + Zod + Vitest + Testing Library + Playwright + vite-plugin-pwa

**设计文档:** `docs/superpowers/specs/2026-10-11-child-learning-design.md`

**文件结构总览：**

```
child-learning/
├── index.html                  # PWA 入口
├── package.json / tsconfig.json / vite.config.ts / playwright.config.ts
├── .gitignore
├── public/icons/icon.svg       # App 图标（Task 13）
├── scripts/validate-content.ts # 关卡 JSON 校验脚本（Task 2）
├── e2e/smoke.spec.ts           # 端到端冒烟（Task 12）
└── src/
    ├── main.tsx / App.tsx / theme.css / setupTests.ts
    ├── types.ts                # Profile / AgeBand / Domain
    ├── content/
    │   ├── schema.ts           # Zod 关卡 schema（类型唯一来源）
    │   ├── index.ts            # 关卡加载（import.meta.glob + 校验 + 查询）
    │   ├── chapters.json       # 章节元数据
    │   └── levels/*.json       # 12 个关卡数据
    ├── stores/
    │   ├── profiles.ts         # 档案 store
    │   └── progress.ts         # 进度 store
    ├── engine/
    │   ├── useSpeech.ts        # TTS 播报（带降级）
    │   ├── unlock.ts           # 关卡解锁规则
    │   └── GameEngine.tsx      # 关卡编排：播报→游戏→奖励
    ├── templates/
    │   ├── TapToIdentify.tsx   # 模板①点选认知
    │   └── CountingGame.tsx    # 模板③数数运算
    ├── components/Buddy.tsx    # 吉祥物伙伴+气泡
    └── screens/
        ├── ProfileSelect.tsx / WorldMap.tsx / ChapterView.tsx
```

---

### Task 1: 项目脚手架与测试环境

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/theme.css`
- Create: `src/setupTests.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: 初始化 git 并创建 .gitignore**

```bash
cd /Users/rayzhang/developement/child-learning
git init
```

`.gitignore`：

```
node_modules
dist
.superpowers
test-results
playwright-report
```

- [ ] **Step 2: 创建 package.json 并安装依赖**

```json
{
  "name": "qiqi-land",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "validate:content": "tsx scripts/validate-content.ts",
    "e2e": "playwright test"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.23.8",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^25.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.5.4",
    "vite": "^5.4.3",
    "vite-plugin-pwa": "^0.20.5",
    "vitest": "^2.1.1"
  }
}
```

Run: `npm install`
Expected: 安装成功，无 ERR

- [ ] **Step 3: 创建 tsconfig.json 与 vite.config.ts**

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "resolveJsonModule": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "scripts", "e2e", "vite.config.ts"]
}
```

`vite.config.ts`（PWA 插件在 Task 13 加入，此处先不配）：

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
```

- [ ] **Step 4: 创建入口文件**

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#FFB74D" />
    <title>奇奇乐园</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/App.tsx`（占位，Task 10 替换为屏幕流转）：

```tsx
export function App() {
  return <h1>奇奇乐园</h1>;
}
```

`src/theme.css`（占位，Task 10 补充完整样式）：

```css
body {
  margin: 0;
  font-family: 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  background: #fff8e7;
}
```

`src/setupTests.ts`：

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: 写一个通过的示例测试并运行**

`src/App.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('渲染应用标题', () => {
  render(<App />);
  expect(screen.getByText('奇奇乐园')).toBeInTheDocument();
});
```

Run: `npm test`
Expected: PASS（1 passed）

- [ ] **Step 6: 验证开发服务器可启动**

Run: `npm run dev`（启动后 Ctrl+C 停止）
Expected: 输出 `Local: http://localhost:5173/`，无报错

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: Vite + React + TS + Vitest 脚手架"
```

---

### Task 2: 内容 Schema 与校验脚本

类型唯一来源是 Zod schema；所有关卡 JSON 必须通过校验。

**Files:**
- Create: `src/types.ts`
- Create: `src/content/schema.ts`
- Create: `src/content/schema.test.ts`
- Create: `scripts/validate-content.ts`

- [ ] **Step 1: 创建共享类型 src/types.ts**

```ts
export type AgeBand = '3-4' | '5-6';
export type Domain = 'language' | 'math' | 'science' | 'art';

export interface Profile {
  id: string;
  name: string;
  avatar: string;
  ageBand: AgeBand;
}
```

- [ ] **Step 2: 写失败的 schema 测试**

`src/content/schema.test.ts`：

```ts
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
});
```

Run: `npm test -- schema`
Expected: FAIL（`Cannot find module './schema'`）

- [ ] **Step 3: 实现 src/content/schema.ts**

```ts
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
]);

export type LevelData = z.infer<typeof LevelSchema>;
export type TapIdentifyData = Extract<LevelData, { template: 'tap-identify' }>['data'];
export type CountData = Extract<LevelData, { template: 'count' }>['data'];
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test -- schema`
Expected: PASS（4 passed）

- [ ] **Step 5: 创建校验脚本 scripts/validate-content.ts**

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LevelSchema } from '../src/content/schema';

const dir = new URL('../src/content/levels/', import.meta.url);
let failed = 0;

for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const raw = JSON.parse(readFileSync(join(dir.pathname, file), 'utf-8'));
  const result = LevelSchema.safeParse(raw);
  if (result.success) {
    console.log(`✅ ${file}`);
  } else {
    console.error(`❌ ${file}`, result.error.issues);
    failed++;
  }
}

if (failed > 0) {
  console.error(`${failed} 个关卡文件校验失败`);
  process.exit(1);
}
console.log('全部关卡数据校验通过');
```

创建空目录占位：`mkdir -p src/content/levels`
Run: `npm run validate:content`
Expected: 输出「全部关卡数据校验通过」（空目录时 0 个文件）

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: 关卡 Zod schema 与内容校验脚本"
```

---

### Task 3: 孩子档案 Store

**Files:**
- Create: `src/stores/profiles.ts`
- Create: `src/stores/profiles.test.ts`

- [ ] **Step 1: 写失败的测试**

`src/stores/profiles.test.ts`：

```ts
import { useProfilesStore } from './profiles';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
});

describe('useProfilesStore', () => {
  it('addProfile 添加档案并返回 id', () => {
    const id = useProfilesStore.getState().addProfile({ name: '小宝', avatar: '🦖', ageBand: '3-4' });
    const state = useProfilesStore.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0]).toMatchObject({ id, name: '小宝', avatar: '🦖', ageBand: '3-4' });
  });

  it('setActive 设置当前档案', () => {
    const id = useProfilesStore.getState().addProfile({ name: '大宝', avatar: '🤖', ageBand: '5-6' });
    useProfilesStore.getState().setActive(id);
    expect(useProfilesStore.getState().activeId).toBe(id);
  });

  it('档案持久化到 localStorage', () => {
    useProfilesStore.getState().addProfile({ name: '小宝', avatar: '🐰', ageBand: '3-4' });
    const raw = localStorage.getItem('qiqi-profiles');
    expect(raw).not.toBeNull();
    expect(raw).toContain('小宝');
  });
});
```

Run: `npm test -- profiles`
Expected: FAIL（`Cannot find module './profiles'`）

- [ ] **Step 2: 实现 src/stores/profiles.ts**

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Profile } from '../types';

interface ProfilesState {
  profiles: Profile[];
  activeId: string | null;
  addProfile: (p: Omit<Profile, 'id'>) => string;
  setActive: (id: string | null) => void;
}

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      addProfile: (p) => {
        const id = crypto.randomUUID();
        set((s) => ({ profiles: [...s.profiles, { ...p, id }] }));
        return id;
      },
      setActive: (id) => set({ activeId: id }),
    }),
    { name: 'qiqi-profiles' },
  ),
);
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- profiles`
Expected: PASS（3 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 孩子档案 store（zustand + localStorage 持久化）"
```

---

### Task 4: 进度 Store 与解锁规则

**Files:**
- Create: `src/stores/progress.ts`
- Create: `src/stores/progress.test.ts`
- Create: `src/engine/unlock.ts`
- Create: `src/engine/unlock.test.ts`

- [ ] **Step 1: 写失败的测试**

`src/stores/progress.test.ts`：

```ts
import { useProgressStore } from './progress';

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ byProfile: {} });
});

describe('useProgressStore', () => {
  it('答对记录星星、attempts 与 correct', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 2);
    expect(useProgressStore.getState().byProfile['p1']['l1']).toEqual({ stars: 2, attempts: 1, correct: 1 });
  });

  it('答错只增加 attempts，不得星', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', false, 0);
    expect(useProgressStore.getState().byProfile['p1']['l1']).toEqual({ stars: 0, attempts: 1, correct: 0 });
  });

  it('星星保留历史最高', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 2);
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(useProgressStore.getState().byProfile['p1']['l1'].stars).toBe(2);
  });

  it('不同档案进度互相隔离', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(useProgressStore.getState().byProfile['p2']).toBeUndefined();
  });

  it('进度持久化到 localStorage', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(localStorage.getItem('qiqi-progress')).toContain('l1');
  });
});
```

`src/engine/unlock.test.ts`：

```ts
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
```

Run: `npm test -- progress unlock`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 src/stores/progress.ts**

```ts
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
```

- [ ] **Step 3: 实现 src/engine/unlock.ts**

```ts
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
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test -- progress unlock`
Expected: PASS（8 passed）

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 进度 store 与关卡解锁规则"
```

---

### Task 5: 语音播报 useSpeech

**Files:**
- Create: `src/engine/useSpeech.ts`
- Create: `src/engine/useSpeech.test.ts`

- [ ] **Step 1: 写失败的测试**

`src/engine/useSpeech.test.ts`：

```ts
import { renderHook } from '@testing-library/react';
import { useSpeech } from './useSpeech';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useSpeech', () => {
  it('支持时调用 speechSynthesis 朗读中文', () => {
    const speak = vi.fn();
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
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
    expect(result.current.supported).toBe(true);
    result.current.speak('你好');
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe('你好');
  });

  it('不支持时静默跳过不报错（降级）', () => {
    // jsdom 默认没有 speechSynthesis
    const { result } = renderHook(() => useSpeech());
    expect(result.current.supported).toBe(false);
    expect(() => result.current.speak('你好')).not.toThrow();
  });
});
```

Run: `npm test -- useSpeech`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 src/engine/useSpeech.ts**

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

  return { speak, supported };
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- useSpeech`
Expected: PASS（2 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: TTS 语音播报 hook（不支持时静默降级）"
```

---

### Task 6: 游戏模板① 点选认知

**Files:**
- Create: `src/templates/TapToIdentify.tsx`
- Create: `src/templates/TapToIdentify.test.tsx`

- [ ] **Step 1: 写失败的测试**

`src/templates/TapToIdentify.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TapToIdentify } from './TapToIdentify';
import type { TapIdentifyData } from '../content/schema';

const data: TapIdentifyData = {
  cards: [
    { id: 'a', emoji: '🍎', label: '红苹果' },
    { id: 'b', emoji: '🍏', label: '青苹果' },
  ],
  answerCardId: 'a',
};

describe('TapToIdentify', () => {
  it('点错触发 onMistake 且不触发 onCorrect', async () => {
    const onCorrect = vi.fn();
    const onMistake = vi.fn();
    render(<TapToIdentify data={data} onCorrect={onCorrect} onMistake={onMistake} />);
    await userEvent.click(screen.getByRole('button', { name: '青苹果' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
    expect(onCorrect).not.toHaveBeenCalled();
  });

  it('点对触发 onCorrect', async () => {
    const onCorrect = vi.fn();
    render(<TapToIdentify data={data} onCorrect={onCorrect} onMistake={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '红苹果' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('答对后再点击不再触发任何回调', async () => {
    const onCorrect = vi.fn();
    const onMistake = vi.fn();
    render(<TapToIdentify data={data} onCorrect={onCorrect} onMistake={onMistake} />);
    await userEvent.click(screen.getByRole('button', { name: '红苹果' }));
    await userEvent.click(screen.getByRole('button', { name: '青苹果' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(onMistake).not.toHaveBeenCalled();
  });
});
```

Run: `npm test -- TapToIdentify`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 src/templates/TapToIdentify.tsx**

```tsx
import { useState } from 'react';
import type { TapIdentifyData } from '../content/schema';

interface Props {
  data: TapIdentifyData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function TapToIdentify({ data, onCorrect, onMistake }: Props) {
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const handleTap = (cardId: string) => {
    if (solved) return;
    if (cardId === data.answerCardId) {
      setSolved(true);
      onCorrect();
    } else {
      setWrongIds((prev) => [...prev, cardId]);
      onMistake();
    }
  };

  return (
    <div className="card-grid">
      {data.cards.map((card) => (
        <button
          key={card.id}
          aria-label={card.label}
          className={[
            'game-card',
            wrongIds.includes(card.id) ? 'shake' : '',
            solved && card.id === data.answerCardId ? 'glow' : '',
          ].join(' ')}
          onClick={() => handleTap(card.id)}
        >
          <span className="card-emoji">{card.emoji}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- TapToIdentify`
Expected: PASS（3 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 游戏模板①点选认知"
```

---

### Task 7: 游戏模板③ 数数运算

objects 支持多组（用于 5-6 岁加法铺垫，如 3🍎+2🍐）。

**Files:**
- Create: `src/templates/CountingGame.tsx`
- Create: `src/templates/CountingGame.test.tsx`

- [ ] **Step 1: 写失败的测试**

`src/templates/CountingGame.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountingGame } from './CountingGame';
import type { CountData } from '../content/schema';

const data: CountData = {
  objects: [{ emoji: '🍎', count: 3 }],
  choices: [2, 3, 4],
  answer: 3,
};

describe('CountingGame', () => {
  it('渲染正确数量的物品', () => {
    render(<CountingGame data={data} onCorrect={vi.fn()} onMistake={vi.fn()} />);
    expect(screen.getAllByText('🍎')).toHaveLength(3);
  });

  it('多组物品全部渲染（加法铺垫）', () => {
    const addData: CountData = {
      objects: [
        { emoji: '🍎', count: 3 },
        { emoji: '🍐', count: 2 },
      ],
      choices: [4, 5, 6],
      answer: 5,
    };
    render(<CountingGame data={addData} onCorrect={vi.fn()} onMistake={vi.fn()} />);
    expect(screen.getAllByText('🍎')).toHaveLength(3);
    expect(screen.getAllByText('🍐')).toHaveLength(2);
  });

  it('选对答案触发 onCorrect', async () => {
    const onCorrect = vi.fn();
    render(<CountingGame data={data} onCorrect={onCorrect} onMistake={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('选错触发 onMistake，答对后忽略后续点击', async () => {
    const onCorrect = vi.fn();
    const onMistake = vi.fn();
    render(<CountingGame data={data} onCorrect={onCorrect} onMistake={onMistake} />);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
    expect(onMistake).toHaveBeenCalledTimes(1);
  });
});
```

Run: `npm test -- CountingGame`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 src/templates/CountingGame.tsx**

```tsx
import { useState } from 'react';
import type { CountData } from '../content/schema';

interface Props {
  data: CountData;
  onCorrect: () => void;
  onMistake: () => void;
}

export function CountingGame({ data, onCorrect, onMistake }: Props) {
  const [wrongChoices, setWrongChoices] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const handleChoice = (n: number) => {
    if (solved) return;
    if (n === data.answer) {
      setSolved(true);
      onCorrect();
    } else {
      setWrongChoices((prev) => [...prev, n]);
      onMistake();
    }
  };

  return (
    <div>
      <div className="objects-row" aria-label="物品">
        {data.objects.map((obj, groupIndex) => (
          <span key={groupIndex} className="object-group">
            {Array.from({ length: obj.count }, (_, i) => (
              <span key={i} className="object-emoji">
                {obj.emoji}
              </span>
            ))}
          </span>
        ))}
      </div>
      <div className="choices-row">
        {data.choices.map((n) => (
          <button
            key={n}
            className={`choice-button ${wrongChoices.includes(n) ? 'shake' : ''}`}
            onClick={() => handleChoice(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- CountingGame`
Expected: PASS（4 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 游戏模板③数数运算（支持多组物品）"
```

---

### Task 8: 伙伴组件与游戏引擎 GameEngine

**Files:**
- Create: `src/components/Buddy.tsx`
- Create: `src/engine/GameEngine.tsx`
- Create: `src/engine/GameEngine.test.tsx`

- [ ] **Step 1: 创建 src/components/Buddy.tsx（纯展示组件，无需测试）**

```tsx
export function Buddy({ avatar, text }: { avatar: string; text: string }) {
  return (
    <div className="buddy">
      <span className="buddy-avatar" role="img" aria-label="伙伴">
        {avatar}
      </span>
      {text && <div className="buddy-bubble">{text}</div>}
    </div>
  );
}
```

- [ ] **Step 2: 写失败的 GameEngine 测试**

`src/engine/GameEngine.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameEngine } from './GameEngine';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import type { LevelData } from '../content/schema';

vi.mock('./useSpeech', () => ({
  useSpeech: () => ({ speak: vi.fn(), supported: true }),
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

  it('答对后进入奖励页并记录星星', async () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByLabel('获得星星')).toHaveTextContent('⭐⭐');
    expect(useProgressStore.getState().byProfile['p1']['l1']).toMatchObject({ stars: 2, correct: 1 });
  });

  it('答错不得星，可继续作答', async () => {
    render(<GameEngine level={level} onExit={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(screen.queryByLabel('获得星星')).not.toBeInTheDocument();
    expect(useProgressStore.getState().byProfile['p1']['l1']).toMatchObject({ stars: 0, attempts: 1 });
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(screen.getByLabel('获得星星')).toBeInTheDocument();
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
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 src/engine/GameEngine.tsx**

```tsx
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    speak(level.storyLine ? `${level.storyLine}，${level.voicePrompt}` : level.voicePrompt);
  }, [level.id, level.storyLine, level.voicePrompt, speak]);

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
      {level.template === 'tap-identify' ? (
        <TapToIdentify data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      ) : (
        <CountingGame data={level.data} onCorrect={handleCorrect} onMistake={handleMistake} />
      )}
    </div>
  );
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npm test -- GameEngine`
Expected: PASS（4 passed）

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 伙伴组件与游戏引擎（播报→游戏→奖励闭环）"
```

---

### Task 9: 档案选择屏 ProfileSelect

**Files:**
- Create: `src/screens/ProfileSelect.tsx`
- Create: `src/screens/ProfileSelect.test.tsx`

- [ ] **Step 1: 写失败的测试**

`src/screens/ProfileSelect.test.tsx`：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelect } from './ProfileSelect';
import { useProfilesStore } from '../stores/profiles';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
});

describe('ProfileSelect', () => {
  it('创建档案并进入', async () => {
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.type(screen.getByLabel('名字'), '小宝');
    await userEvent.click(screen.getByRole('button', { name: '5-6岁' }));
    await userEvent.click(screen.getByRole('button', { name: '开始玩' }));
    const state = useProfilesStore.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0]).toMatchObject({ name: '小宝', ageBand: '5-6' });
    expect(state.activeId).toBe(state.profiles[0].id);
    expect(onEnter).toHaveBeenCalled();
  });

  it('名字为空时不能创建', async () => {
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.click(screen.getByRole('button', { name: '开始玩' }));
    expect(useProfilesStore.getState().profiles).toHaveLength(0);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('点击已有档案直接进入', async () => {
    useProfilesStore.setState({
      profiles: [{ id: 'p1', name: '大宝', avatar: '🤖', ageBand: '5-6' }],
      activeId: null,
    });
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.click(screen.getByRole('button', { name: /大宝/ }));
    expect(useProfilesStore.getState().activeId).toBe('p1');
    expect(onEnter).toHaveBeenCalled();
  });
});
```

Run: `npm test -- ProfileSelect`
Expected: FAIL（模块不存在）

- [ ] **Step 2: 实现 src/screens/ProfileSelect.tsx**

```tsx
import { useState } from 'react';
import { useProfilesStore } from '../stores/profiles';
import type { AgeBand } from '../types';

const AVATARS = ['🦖', '🐰', '🤖'];
const AGE_BANDS: AgeBand[] = ['3-4', '5-6'];

export function ProfileSelect({ onEnter }: { onEnter: () => void }) {
  const profiles = useProfilesStore((s) => s.profiles);
  const setActive = useProfilesStore((s) => s.setActive);
  const addProfile = useProfilesStore((s) => s.addProfile);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [ageBand, setAgeBand] = useState<AgeBand>('3-4');

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = addProfile({ name: name.trim(), avatar, ageBand });
    setActive(id);
    onEnter();
  };

  return (
    <div className="profile-select">
      <h1 className="app-title">奇奇乐园</h1>
      <div className="profile-list">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="profile-button"
            onClick={() => {
              setActive(p.id);
              onEnter();
            }}
          >
            <span className="profile-avatar">{p.avatar}</span>
            <span>{p.name}</span>
          </button>
        ))}
      </div>
      <div className="profile-create">
        <input
          aria-label="名字"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="你的名字"
        />
        <div role="radiogroup" aria-label="头像" className="option-row">
          {AVATARS.map((a) => (
            <button key={a} aria-label={`头像${a}`} aria-pressed={avatar === a} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="年龄" className="option-row">
          {AGE_BANDS.map((b) => (
            <button key={b} aria-pressed={ageBand === b} onClick={() => setAgeBand(b)}>
              {b}岁
            </button>
          ))}
        </div>
        <button className="big-button" onClick={handleCreate}>
          开始玩
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 运行测试确认通过**

Run: `npm test -- ProfileSelect`
Expected: PASS（3 passed）

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 档案选择屏（创建/选择档案）"
```

---

### Task 10: 世界地图、章节列表与 App 流转

**Files:**
- Create: `src/content/chapters.json`
- Create: `src/content/index.ts`
- Create: `src/screens/WorldMap.tsx`
- Create: `src/screens/ChapterView.tsx`
- Modify: `src/App.tsx`（整体替换）
- Modify: `src/theme.css`（整体替换）
- Modify: `src/App.test.tsx`（整体替换）

- [ ] **Step 1: 创建 src/content/chapters.json**

```json
[
  {
    "id": "math-ch1",
    "island": "math",
    "title": "数数谷",
    "story": "数字过山车的零件散落了，帮奇奇收集数字零件吧！"
  }
]
```

- [ ] **Step 2: 创建 src/content/index.ts（关卡加载：glob 导入 + schema 校验 + 查询）**

```ts
import { LevelSchema, type LevelData } from './schema';

const modules = import.meta.glob('./levels/*.json', { eager: true, import: 'default' });

export const levels: LevelData[] = (Object.values(modules) as unknown[])
  .map((raw) => {
    const result = LevelSchema.safeParse(raw);
    return result.success ? result.data : null;
  })
  .filter((l): l is LevelData => l !== null);

export function getChapterLevels(chapterId: string): LevelData[] {
  return levels.filter((l) => l.chapter === chapterId).sort((a, b) => a.order - b.order);
}

export function getLevel(id: string): LevelData | undefined {
  return levels.find((l) => l.id === id);
}
```

- [ ] **Step 3: 创建 src/screens/WorldMap.tsx**

```tsx
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';

const ISLANDS = [
  { domain: 'math', emoji: '🔢', name: '数学山', open: true },
  { domain: 'language', emoji: '🔤', name: '语言岛', open: false },
  { domain: 'science', emoji: '🦕', name: '科学森林', open: false },
  { domain: 'art', emoji: '🎨', name: '艺术城堡', open: false },
] as const;

export function WorldMap({ onOpenIsland }: { onOpenIsland: () => void }) {
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
            onClick={() => island.open && onOpenIsland()}
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

- [ ] **Step 4: 创建 src/screens/ChapterView.tsx**

```tsx
import chapters from '../content/chapters.json';
import { getChapterLevels } from '../content';
import { isLevelUnlocked } from '../engine/unlock';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore, type LevelProgress } from '../stores/progress';

const EMPTY: Record<string, LevelProgress> = {};

interface Props {
  chapterId: string;
  onPlayLevel: (levelId: string) => void;
  onBack: () => void;
}

export function ChapterView({ chapterId, onPlayLevel, onBack }: Props) {
  const chapter = chapters.find((c) => c.id === chapterId);
  const ageBand = useProfilesStore(
    (s) => s.profiles.find((p) => p.id === s.activeId)?.ageBand ?? '3-4',
  );
  const activeId = useProfilesStore((s) => s.activeId);
  const levelProgress = useProgressStore((s) =>
    activeId ? s.byProfile[activeId] ?? EMPTY : EMPTY,
  );

  const chapterLevels = getChapterLevels(chapterId).filter((l) => l.ageBand === ageBand);

  if (!chapter) return null;

  return (
    <div className="chapter-view">
      <button className="back-button" onClick={onBack}>
        ← 返回地图
      </button>
      <h1>{chapter.title}</h1>
      <p className="chapter-story">{chapter.story}</p>
      <div className="level-list">
        {chapterLevels.map((level, index) => {
          const unlocked = isLevelUnlocked(chapterLevels, index, levelProgress);
          const stars = levelProgress[level.id]?.stars ?? 0;
          return (
            <button
              key={level.id}
              className="level-button"
              disabled={!unlocked}
              onClick={() => onPlayLevel(level.id)}
            >
              {unlocked ? `第 ${index + 1} 关` : '🔒'}
              {stars > 0 && <span aria-label="关卡星星">{'⭐'.repeat(stars)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: 替换 src/App.tsx 为屏幕流转**

```tsx
import { useState } from 'react';
import { ProfileSelect } from './screens/ProfileSelect';
import { WorldMap } from './screens/WorldMap';
import { ChapterView } from './screens/ChapterView';
import { GameEngine } from './engine/GameEngine';
import { getLevel } from './content';

type Screen =
  | { name: 'profiles' }
  | { name: 'map' }
  | { name: 'chapter'; chapterId: string }
  | { name: 'game'; levelId: string };

const MAP = { name: 'map' } as const;

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'profiles' });

  switch (screen.name) {
    case 'profiles':
      return <ProfileSelect onEnter={() => setScreen(MAP)} />;
    case 'map':
      return <WorldMap onOpenIsland={() => setScreen({ name: 'chapter', chapterId: 'math-ch1' })} />;
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
      if (!level) return <WorldMap onOpenIsland={() => setScreen({ name: 'chapter', chapterId: 'math-ch1' })} />;
      return (
        <GameEngine
          level={level}
          onExit={() => setScreen({ name: 'chapter', chapterId: level.chapter })}
        />
      );
    }
  }
}
```

- [ ] **Step 6: 替换 src/theme.css 为完整样式**

```css
body {
  margin: 0;
  font-family: 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  background: #fff8e7;
  color: #4a3728;
  -webkit-tap-highlight-color: transparent;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
}

.app-title {
  text-align: center;
  color: #ff8a65;
  font-size: 2.4rem;
}

.big-button {
  background: linear-gradient(180deg, #ffb74d, #ff8a65);
  color: #fff;
  font-size: 1.4rem;
  padding: 14px 40px;
  border-radius: 999px;
  box-shadow: 0 4px 0 #e06b45;
}

.big-button:active {
  transform: translateY(3px);
  box-shadow: none;
}

/* 档案选择 */
.profile-select {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
}

.profile-list {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
}

.profile-button {
  background: #fff;
  border-radius: 20px;
  padding: 16px 24px;
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  font-size: 2.6rem;
}

.profile-create {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-create input {
  font-size: 1.2rem;
  padding: 12px 20px;
  border-radius: 999px;
  border: 2px solid #ffcc80;
  text-align: center;
}

.option-row {
  display: flex;
  gap: 12px;
}

.option-row button {
  font-size: 1.6rem;
  background: #fff;
  border-radius: 16px;
  padding: 10px 16px;
  border: 3px solid transparent;
}

.option-row button[aria-pressed='true'] {
  border-color: #ff8a65;
  background: #fff3e0;
}

/* 世界地图 */
.world-map {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
}

.map-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.3rem;
}

.island-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 24px;
}

.island-card {
  background: #fff;
  border-radius: 28px;
  padding: 32px 16px;
  font-size: 1.4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.island-emoji {
  font-size: 3.4rem;
}

.island-locked {
  opacity: 0.45;
}

.island-soon {
  font-size: 0.9rem;
  color: #999;
}

/* 章节 */
.chapter-view {
  max-width: 560px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
}

.back-button {
  background: none;
  font-size: 1.1rem;
  color: #ff8a65;
}

.chapter-story {
  color: #8d6e63;
}

.level-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 20px;
}

.level-button {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  font-size: 1.3rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.level-button:disabled {
  opacity: 0.5;
}

/* 游戏 */
.game-screen {
  max-width: 640px;
  margin: 0 auto;
  padding: 16px;
  text-align: center;
}

.buddy {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  min-height: 72px;
}

.buddy-avatar {
  font-size: 3rem;
}

.buddy-bubble {
  background: #fff;
  border-radius: 18px;
  padding: 12px 18px;
  font-size: 1.15rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.voice-prompt {
  font-size: 1.4rem;
  color: #5d4037;
}

.card-grid {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.game-card {
  background: #fff;
  border-radius: 24px;
  width: 130px;
  height: 130px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.card-emoji {
  font-size: 4rem;
}

.glow {
  outline: 5px solid #ffd54f;
  background: #fffde7;
}

.objects-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.object-group {
  display: inline-flex;
  gap: 8px;
  margin: 0 10px;
}

.object-emoji {
  font-size: 3rem;
}

.choices-row {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.choice-button {
  background: #fff;
  border-radius: 50%;
  width: 84px;
  height: 84px;
  font-size: 2rem;
  box-shadow: 0 4px 0 #ffcc80;
}

.choice-button:active {
  transform: translateY(3px);
  box-shadow: none;
}

.shake {
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

/* 奖励页 */
.reward-view {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.reward-stars {
  font-size: 4rem;
  animation: pop 0.5s ease-out;
}

@keyframes pop {
  0% { transform: scale(0); }
  80% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

- [ ] **Step 7: 替换 src/App.test.tsx（占位测试已过时）**

```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useProfilesStore } from './stores/profiles';
import { useProgressStore } from './stores/progress';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
  useProgressStore.setState({ byProfile: {} });
});

it('默认显示档案选择屏', () => {
  render(<App />);
  expect(screen.getByLabel('名字')).toBeInTheDocument();
});
```

- [ ] **Step 8: 运行全部测试与类型检查**

Run: `npm test && npm run typecheck`
Expected: 全部 PASS，无类型错误

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 世界地图、章节列表与 App 屏幕流转"
```

---

### Task 11: 数学山第一章内容（12 个 JSON 关卡）

3-4 岁档 6 关（数数 1-5、认数字、认颜色形状），5-6 岁档 6 关（数数到 10、加法铺垫）。文件均放在 `src/content/levels/`。

**Files:**
- Create: `src/content/levels/` 下 12 个 JSON 文件

- [ ] **Step 1: 创建 3-4 岁档 6 个关卡**

`src/content/levels/math34-01.json`：

```json
{
  "id": "math34-01",
  "chapter": "math-ch1",
  "order": 1,
  "domain": "math",
  "ageBand": "3-4",
  "template": "count",
  "voicePrompt": "数一数，有几个苹果？",
  "storyLine": "欢迎来到数数谷！数字过山车的零件散落了，帮我收集吧！",
  "reward": { "stars": 1 },
  "data": { "objects": [{ "emoji": "🍎", "count": 3 }], "choices": [2, 3, 4], "answer": 3 }
}
```

`src/content/levels/math34-02.json`：

```json
{
  "id": "math34-02",
  "chapter": "math-ch1",
  "order": 2,
  "domain": "math",
  "ageBand": "3-4",
  "template": "tap-identify",
  "voicePrompt": "点一点数字 2",
  "reward": { "stars": 1 },
  "data": {
    "cards": [
      { "id": "a", "emoji": "1️⃣", "label": "数字1" },
      { "id": "b", "emoji": "2️⃣", "label": "数字2" },
      { "id": "c", "emoji": "3️⃣", "label": "数字3" }
    ],
    "answerCardId": "b"
  }
}
```

`src/content/levels/math34-03.json`：

```json
{
  "id": "math34-03",
  "chapter": "math-ch1",
  "order": 3,
  "domain": "math",
  "ageBand": "3-4",
  "template": "count",
  "voicePrompt": "数一数，有几只小鸭子？",
  "reward": { "stars": 1 },
  "data": { "objects": [{ "emoji": "🦆", "count": 5 }], "choices": [4, 5, 6], "answer": 5 }
}
```

`src/content/levels/math34-04.json`：

```json
{
  "id": "math34-04",
  "chapter": "math-ch1",
  "order": 4,
  "domain": "math",
  "ageBand": "3-4",
  "template": "tap-identify",
  "voicePrompt": "点一点红色的苹果",
  "reward": { "stars": 1 },
  "data": {
    "cards": [
      { "id": "a", "emoji": "🍎", "label": "红色的苹果" },
      { "id": "b", "emoji": "🍏", "label": "绿色的苹果" }
    ],
    "answerCardId": "a"
  }
}
```

`src/content/levels/math34-05.json`：

```json
{
  "id": "math34-05",
  "chapter": "math-ch1",
  "order": 5,
  "domain": "math",
  "ageBand": "3-4",
  "template": "count",
  "voicePrompt": "数一数，有几颗星星？",
  "reward": { "stars": 1 },
  "data": { "objects": [{ "emoji": "⭐", "count": 4 }], "choices": [3, 4, 5], "answer": 4 }
}
```

`src/content/levels/math34-06.json`：

```json
{
  "id": "math34-06",
  "chapter": "math-ch1",
  "order": 6,
  "domain": "math",
  "ageBand": "3-4",
  "template": "tap-identify",
  "voicePrompt": "点一点圆形",
  "reward": { "stars": 2 },
  "data": {
    "cards": [
      { "id": "a", "emoji": "🔴", "label": "圆形" },
      { "id": "b", "emoji": "🟦", "label": "正方形" },
      { "id": "c", "emoji": "🔺", "label": "三角形" }
    ],
    "answerCardId": "a"
  }
}
```

- [ ] **Step 2: 创建 5-6 岁档 6 个关卡**

`src/content/levels/math56-01.json`：

```json
{
  "id": "math56-01",
  "chapter": "math-ch1",
  "order": 1,
  "domain": "math",
  "ageBand": "5-6",
  "template": "count",
  "voicePrompt": "数一数，有几个苹果？",
  "storyLine": "欢迎来到数数谷！数字过山车需要更厉害的帮手，就是你！",
  "reward": { "stars": 1 },
  "data": { "objects": [{ "emoji": "🍎", "count": 7 }], "choices": [5, 7, 8], "answer": 7 }
}
```

`src/content/levels/math56-02.json`：

```json
{
  "id": "math56-02",
  "chapter": "math-ch1",
  "order": 2,
  "domain": "math",
  "ageBand": "5-6",
  "template": "count",
  "voicePrompt": "3 个苹果和 2 个梨，一共有几个水果？",
  "reward": { "stars": 1 },
  "data": {
    "objects": [
      { "emoji": "🍎", "count": 3 },
      { "emoji": "🍐", "count": 2 }
    ],
    "choices": [4, 5, 6],
    "answer": 5
  }
}
```

`src/content/levels/math56-03.json`：

```json
{
  "id": "math56-03",
  "chapter": "math-ch1",
  "order": 3,
  "domain": "math",
  "ageBand": "5-6",
  "template": "count",
  "voicePrompt": "4 个气球又飞来了 4 个，现在有几个气球？",
  "reward": { "stars": 1 },
  "data": {
    "objects": [
      { "emoji": "🎈", "count": 4 },
      { "emoji": "🎈", "count": 4 }
    ],
    "choices": [7, 8, 9],
    "answer": 8
  }
}
```

`src/content/levels/math56-04.json`：

```json
{
  "id": "math56-04",
  "chapter": "math-ch1",
  "order": 4,
  "domain": "math",
  "ageBand": "5-6",
  "template": "tap-identify",
  "voicePrompt": "点一点数字 6，小心别点到 9 哦",
  "reward": { "stars": 1 },
  "data": {
    "cards": [
      { "id": "a", "emoji": "9️⃣", "label": "数字9" },
      { "id": "b", "emoji": "6️⃣", "label": "数字6" },
      { "id": "c", "emoji": "8️⃣", "label": "数字8" }
    ],
    "answerCardId": "b"
  }
}
```

`src/content/levels/math56-05.json`：

```json
{
  "id": "math56-05",
  "chapter": "math-ch1",
  "order": 5,
  "domain": "math",
  "ageBand": "5-6",
  "template": "count",
  "voicePrompt": "数一数，有几只小鸡？",
  "reward": { "stars": 1 },
  "data": { "objects": [{ "emoji": "🐤", "count": 9 }], "choices": [8, 9, 10], "answer": 9 }
}
```

`src/content/levels/math56-06.json`：

```json
{
  "id": "math56-06",
  "chapter": "math-ch1",
  "order": 6,
  "domain": "math",
  "ageBand": "5-6",
  "template": "count",
  "voicePrompt": "5 条小鱼和 3 条小鱼合在一起，一共几条？",
  "reward": { "stars": 2 },
  "data": {
    "objects": [
      { "emoji": "🐟", "count": 5 },
      { "emoji": "🐟", "count": 3 }
    ],
    "choices": [7, 8, 9],
    "answer": 8
  }
}
```

- [ ] **Step 3: 运行内容校验**

Run: `npm run validate:content`
Expected: 12 个 ✅，「全部关卡数据校验通过」

- [ ] **Step 4: 运行全部测试确认无回归**

Run: `npm test`
Expected: 全部 PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "content: 数学山第一章 12 关（双年龄档）"
```

---

### Task 12: Playwright 端到端冒烟测试

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: 安装浏览器**

Run: `npx playwright install chromium`
Expected: 下载完成

- [ ] **Step 2: 创建 playwright.config.ts**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: 创建 e2e/smoke.spec.ts**

走完「创建档案 → 地图 → 数学山 → 第 1 关 → 答对 → 得星星」完整闭环（3-4 岁档第 1 关答案为 3）：

```ts
import { test, expect } from '@playwright/test';

test('创建档案 → 进入数学山 → 玩一关 → 得星星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /数学山/ }).click();
  await page.getByRole('button', { name: /第 1 关/ }).click();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible();
});
```

- [ ] **Step 4: 运行端到端测试**

Run: `npm run e2e`
Expected: 1 passed

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: Playwright 端到端冒烟（完整游戏闭环）"
```

---

### Task 13: PWA 离线配置与构建验证

**Files:**
- Modify: `vite.config.ts`（整体替换）
- Create: `public/icons/icon.svg`
- Create: `src/pwa.d.ts`
- Modify: `src/main.tsx`（整体替换）
- Modify: `index.html`（head 内追加图标链接）
- Create: `README.md`

- [ ] **Step 1: 创建 App 图标 public/icons/icon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="110" fill="#FFB74D"/>
  <text x="50%" y="54%" font-size="260" text-anchor="middle" dominant-baseline="middle">🎡</text>
</svg>
```

- [ ] **Step 2: 替换 vite.config.ts 加入 PWA 插件**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '奇奇乐园',
        short_name: '奇奇乐园',
        display: 'standalone',
        background_color: '#FFF8E7',
        theme_color: '#FFB74D',
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    exclude: ['e2e/**', 'node_modules/**'],
  },
});
```

> 注：iPad 的 apple-touch-icon 严格说需要 PNG，M1 先用 SVG 图标，后续里程碑可替换为 180×180 PNG。

- [ ] **Step 3: 创建 src/pwa.d.ts 并更新 main.tsx**

`src/pwa.d.ts`：

```ts
/// <reference types="vite-plugin-pwa/client" />
```

`src/main.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import './theme.css';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`index.html` 的 `<head>` 内追加一行：

```html
    <link rel="apple-touch-icon" href="icons/icon.svg" />
```

- [ ] **Step 4: 创建 README.md**

```markdown
# 奇奇乐园

给 3-6 岁孩子的离线学习 PWA。

## 开发

npm install
npm run dev          # 开发服务器（--host，iPad 同 Wi-Fi 可访问）
npm test             # 单元测试
npm run e2e          # 端到端测试
npm run validate:content  # 校验关卡 JSON
npm run build        # 构建

## iPad 安装

部署到 HTTPS 静态托管（如 Cloudflare Pages）后，iPad Safari 打开 → 分享 → 添加到主屏幕。

## 添加新关卡

在 src/content/levels/ 新增 JSON 文件（参照现有关卡格式），运行 npm run validate:content 校验。
```

- [ ] **Step 5: 构建并验证 PWA 产物**

Run: `npm run build`
Expected: 构建成功，dist/ 中包含 `manifest.webmanifest` 与 `sw.js`

Run: `npm run preview`（启动后 Ctrl+C）
Expected: 可访问，控制台无错误

- [ ] **Step 6: 运行全部测试做最终确认**

Run: `npm test && npm run typecheck && npm run validate:content`
Expected: 全部通过

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: PWA 离线支持（manifest + service worker）"
```

---

## 里程碑 1 完成标准

- [ ] `npm test`、`npm run e2e`、`npm run validate:content`、`npm run typecheck` 全部通过
- [ ] iPad Safari 打开 dev 服务器地址，能完成：创建档案 → 数学山 → 玩关 → 得星星
- [ ] 两个档案（3-4 / 5-6）各自看到对应年龄档的 6 关
- [ ] 后续里程碑各自单独成计划：M2 古诗乐园、M3 四岛内容铺开、M4 家长中心
