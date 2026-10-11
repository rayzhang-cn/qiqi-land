# 奇奇乐园 · 里程碑 4：科学森林 + 艺术城堡 设计文档

日期：2026-10-11
状态：已确认（用户授权直接开始；家长中心不做）

## 1. 范围

- **科学森林**（科学与自然）与**艺术城堡**（艺术与创造）两个岛开放
- 新增 3 个游戏模板：**分类**（拖拽/点选分类）、**涂色画板**（canvas 自由画）、**音乐节奏**（西蒙游戏）
- 复用现有「点选认知」模板做认动物/认天气/认天体/认颜色
- **不做家长中心**（跳过屏幕时间/进度报告/IndexedDB）

## 2. 新增游戏模板

### 2.1 分类 classify

数据模型：

```ts
data: {
  buckets: { id: string; label: string; emoji: string }[];              // 2-3 个桶
  items: { id: string; emoji: string; label: string; bucketId: string }[]; // 4-8 个物品
}
```

交互（点选分类，对小孩手指更友好，非自由拖拽）：**点一个物品（高亮）→ 点一个桶**。
- 正确：物品「飞」进桶（CSS 过渡），成功音效
- 错误：物品抖动 + 鼓励语音，可重试
- 全部物品归位 → `onCorrect`（得星）

Schema 交叉校验：`items[].bucketId` 必须存在于 `buckets[].id`。

### 2.2 涂色画板 coloring

数据模型：

```ts
data: {
  palette: string[];  // 调色盘颜色（hex，4-8 个）
  prompt?: string;    // 创作提示语
}
```

交互：调色盘选色 → 手指在 canvas 上画（pointer 事件）→ 橡皮 / 清空 → 点「完成」。
- 无对错（创造性活动），点「完成」→ `onCorrect`（得星）
- 年龄档共用（不区分 3-4 / 5-6）

### 2.3 音乐节奏 music（西蒙游戏）

数据模型：

```ts
data: {
  notes: { id: string; emoji: string; tone: number }[];  // 4 个彩色动物键，tone 为频率 Hz
  rounds: number;        // 总轮数（如 4）
  startLength: number;   // 起始序列长度（如 2）
}
```

交互：4 个彩色动物键各发一个音（Web Audio oscillator）。
- 游戏「演奏」一个序列（第 1 轮 2 个音，每轮 +1，最多 rounds 轮）
- 孩子按顺序重复点击
- 正确 → 下一轮；错误 → 重播序列（无惩罚），重试
- 全部轮数完成 → `onCorrect`（得星）

## 3. 内容（章节）

`chapters.json` 新增（`island` 字段对应 science/art）：

| island | 章节 id | 标题 | 玩法 |
|--------|---------|------|------|
| science | science-animals | 动物王国 | 认动物（点选）+ 动物分类 |
| science | science-weather | 四季天气 | 认天气（点选）+ 天气分类 |
| science | science-space | 小小宇航员 | 认天体（点选） |
| art | art-colors | 颜色实验室 | 认颜色（点选） |
| art | art-doodle | 涂鸦画室 | 涂色画板 |
| art | art-rhythm | 节奏音乐厅 | 音乐节奏 |

内容量：科学约 12 关、艺术约 10 关（双年龄档：3-4 档 2-3 选项/短序列，5-6 档 4 选项/长序列；涂色/音乐年龄档共用）。

## 4. 路由与岛屿

- `islands.ts`：science、art 的 `open` 改为 `true`
- `App.tsx` `openIsland`：math/science/art → `chapters`，language → `poem-list`
- `ChapterSelect` 已按 island + 年龄档过滤，无需改动

## 5. 完成与得星

- 分类/认颜色/认动物/认天气/认天体：答对得星（复用现有判分）
- 涂色/音乐：完成创作/节奏得星（「完成即得星」，无对错）

## 6. 测试

- Schema：3 个新分支合法/非法、classify 的 bucketId 交叉校验
- ClassifyGame：点选放置正确/错误、全部归位触发 onCorrect
- ColoringGame：调色盘选色、完成/清空触发回调（canvas 绘制逻辑用 mock，e2e 覆盖真实绘制）
- MusicGame：序列状态机（播放→重复→匹配）、正确推进/错误重播/完成（音频用抽象 mock）
- validate:content：3 类关卡过 schema
- e2e：科学分类关 + 艺术涂色关 + 艺术音乐关

## 7. 明确不做

- 家长中心（屏幕时间/进度报告/难度调整）
- IndexedDB 迁移、档案切换
- 自由拖拽（分类用点选放置，拖拽作为后续增强）
- 诗配画、诗句补全/排序
