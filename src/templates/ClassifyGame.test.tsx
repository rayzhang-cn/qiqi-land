import { render, screen, fireEvent } from '@testing-library/react';
import { ClassifyGame } from './ClassifyGame';
import type { ClassifyData } from '../content/schema';

const data: ClassifyData = {
  buckets: [
    { id: 'fly', label: '会飞', emoji: '☁️' },
    { id: 'water', label: '水里', emoji: '🌊' },
  ],
  items: [
    { id: 'bird', emoji: '🐦', label: '小鸟', bucketId: 'fly' },
    { id: 'fish', emoji: '🐟', label: '鱼', bucketId: 'water' },
  ],
};

describe('ClassifyGame', () => {
  it('渲染桶和物品', () => {
    render(<ClassifyGame data={data} onCorrect={vi.fn()} onMistake={vi.fn()} />);
    expect(screen.getByRole('button', { name: '会飞' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '小鸟' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '鱼' })).toBeInTheDocument();
  });

  it('点物品再点正确桶 → 物品归位', () => {
    render(<ClassifyGame data={data} onCorrect={vi.fn()} onMistake={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '小鸟' }));
    fireEvent.click(screen.getByRole('button', { name: '会飞' }));
    expect(screen.queryByRole('button', { name: '小鸟' })).not.toBeInTheDocument();
  });

  it('点错桶触发 onMistake', () => {
    const onMistake = vi.fn();
    render(<ClassifyGame data={data} onCorrect={vi.fn()} onMistake={onMistake} />);
    fireEvent.click(screen.getByRole('button', { name: '鱼' }));
    fireEvent.click(screen.getByRole('button', { name: '会飞' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
  });

  it('全部归位触发 onCorrect 一次', () => {
    const onCorrect = vi.fn();
    render(<ClassifyGame data={data} onCorrect={onCorrect} onMistake={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '小鸟' }));
    fireEvent.click(screen.getByRole('button', { name: '会飞' }));
    fireEvent.click(screen.getByRole('button', { name: '鱼' }));
    fireEvent.click(screen.getByRole('button', { name: '水里' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });
});
