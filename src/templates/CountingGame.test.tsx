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