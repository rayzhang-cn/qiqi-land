# 奇奇乐园 · M3 迭代设计：30以内加减法 + 古诗跟读读全

日期：2026-10-11
状态：已确认（用户授权直接开始）

## 1. 改动 1：古诗跟读从诗名开始往下读

- 朗读序列从「正文逐句」改为「**诗名 → 作者·朝代 → 正文逐句**」
- karaoke 高亮同步扩展：读诗名时高亮诗名，读作者·朝代时高亮作者行，然后正文逐字高亮
- 读作者·朝代的具体文案：`"静夜思"` → `"李白，唐"` → `"床前明月光"` …（作者与朝代之间用逗号分隔，朝代不读「朝」字）

## 2. 改动 2：数学山 30 以内加减法（选择题 + 填空题，随机出题）

### 2.1 数据模型

`LevelSchema` 新增 `arithmetic` 分支（`mode` 为分支字段，`data` 为随机生成配置）：

```ts
LevelBase.extend({
  template: z.literal('arithmetic'),
  mode: z.enum(['choice', 'fill']),
  data: z.object({
    op: z.enum(['add', 'sub', 'mixed']),
    maxResult: z.number().int().min(1).max(30),
    problemCount: z.number().int().min(1).max(20),
  }),
})
```

`ArithmeticData = Extract<LevelData, { template: 'arithmetic' }>['data']`；分支上有 `mode`。

### 2.2 随机出题（纯函数，可注入随机源）

- `generateProblem(config, random?): { a, b, op, answer, text }`
  - add：`a=rand(1..max-1)`，`b=rand(1..max-a)`，`answer=a+b`（≤max）
  - sub：`a=rand(1..max)`，`b=rand(0..a)`，`answer=a-b`（≥0）
  - mixed：随机挑 add/sub
- `generateChoices(answer, max, random?): number[]`：正确答案 + 2 个 ±1~3 干扰项（clamp 0..max、去重），不足 3 个用 0/max 兜底，最后洗牌

### 2.3 ArithmeticGame 组件

- Props `{ data, mode, onCorrect, onMistake }`
- 挂载时一次性生成 `problemCount` 道题（重进关卡 = 新题）
- 选择题：显示 `3 + 5 = ?`，3 个大按钮选项
- 填空题：显示 `3 + 5 = ?`，内置大数字键盘（0-9、⌫ 退格、✓ 确认，最多 2 位数）
- 单题答对 → 下一题；答完 `problemCount` 题 → `onCorrect`（整轮完成）；单题答错 → `onMistake` + 重试该题

### 2.4 章节选择

- `chapters.json` 新增 `math-ch2`「加减工厂」
- 新增 `ChapterSelect` 屏幕：按 island 列出章节，点选进入 ChapterView
- WorldMap 数学山 → ChapterSelect(math) → ChapterView

### 2.5 内容（5-6 档，8 关）

| 关 | mode | op | maxResult |
|----|------|-----|-----------|
| 1 | choice | add | 10 |
| 2 | choice | mixed | 20 |
| 3 | choice | add | 30 |
| 4 | choice | mixed | 30 |
| 5 | fill | add | 10 |
| 6 | fill | mixed | 20 |
| 7 | fill | add | 30 |
| 8 | fill | mixed | 30 |

每关 `problemCount: 5`，`reward.stars: 1`。3-4 档不加算术内容（保持现有数数内容）。

## 3. 测试

- `arithmetic.ts` 纯函数：注入固定随机源验证不变量（add 时 a+b=answer 且 answer≤max；sub 时 a-b=answer 且 answer≥0；choices 含 answer、长度 3、唯一、范围合法）
- `ArithmeticGame`：choice 答对推进/答完 onCorrect/答错 onMistake+重试；fill 数字键盘输入/退格/确认
- `PoemRecital`：朗读序列首段为诗名+作者（mock speak 断言先读诗名作者再读正文）
- `ChapterSelect`：按 island 渲染章节、点选触发
- `validate:content`：arithmetic 关卡过 schema
- e2e：算术关卡（choice）点选得星 + 古诗跟读（含诗名）流程

## 4. 明确不做

- 3-4 档算术内容（太难）
- 进位/借位标注等教学可视化（后续）
- 诗配画、诗句补全/排序（仍推迟）
