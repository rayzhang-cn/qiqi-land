import { render, screen, fireEvent, act } from '@testing-library/react';
import { MusicGame } from './MusicGame';
import type { MusicData } from '../content/schema';

vi.mock('./audio', () => ({ playTone: vi.fn(), resumeAudio: vi.fn() }));

const data: MusicData = {
  notes: [
    { id: 'cat', emoji: '🐱', tone: 262 },
    { id: 'dog', emoji: '🐶', tone: 330 },
  ],
  rounds: 1,
  startLength: 1,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('MusicGame', () => {
  it('开始时播放序列，之后进入监听', () => {
    render(<MusicGame data={data} onCorrect={vi.fn()} onMistake={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始' }));
    act(() => { vi.advanceTimersByTime(1100); });
    expect(screen.getByText(/该你啦/)).toBeInTheDocument();
  });

  it('正确重复完成全部轮触发 onCorrect', () => {
    const onCorrect = vi.fn();
    render(<MusicGame data={data} onCorrect={onCorrect} onMistake={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始' }));
    act(() => { vi.advanceTimersByTime(1100); });
    fireEvent.click(screen.getByRole('button', { name: 'cat' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('点错触发 onMistake', () => {
    const onMistake = vi.fn();
    render(<MusicGame data={data} onCorrect={vi.fn()} onMistake={onMistake} />);
    fireEvent.click(screen.getByRole('button', { name: '开始' }));
    act(() => { vi.advanceTimersByTime(1100); });
    fireEvent.click(screen.getByRole('button', { name: 'dog' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
  });
});
