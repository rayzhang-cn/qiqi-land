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

const arithLevel: LevelData = {
  id: 'arith1',
  chapter: 'math-ch2',
  order: 1,
  domain: 'math',
  ageBand: '5-6',
  template: 'arithmetic',
  mode: 'choice',
  voicePrompt: '算一算，选出正确的答案',
  reward: { stars: 1 },
  data: { op: 'add', maxResult: 10, problemCount: 5 },
};

const classifyLevel: LevelData = {
  id: 'cl1',
  chapter: 'science-animals',
  order: 1,
  domain: 'science',
  ageBand: '3-4',
  template: 'classify',
  voicePrompt: '把会飞的动物拖进云朵',
  reward: { stars: 1 },
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

  it('arithmetic 关卡渲染算术游戏', () => {
    render(<GameEngine level={arithLevel} onExit={vi.fn()} />);
    expect(screen.getByText('第 1 / 5 题')).toBeInTheDocument();
  });

  it('classify 关卡渲染分类游戏', () => {
    render(<GameEngine level={classifyLevel} onExit={vi.fn()} />);
    expect(screen.getByRole('button', { name: '小鸟' })).toBeInTheDocument();
  });
});
