import { render, screen, fireEvent } from '@testing-library/react';
import { ColoringGame } from './ColoringGame';
import type { ColoringData } from '../content/schema';

const data: ColoringData = { palette: ['#e53935', '#43a047', '#1e88e5'] };

describe('ColoringGame', () => {
  it('渲染调色盘、橡皮、清空、完成按钮', () => {
    render(<ColoringGame data={data} onCorrect={vi.fn()} />);
    expect(screen.getByRole('button', { name: '颜色#e53935' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '橡皮' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '清空' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '完成' })).toBeInTheDocument();
  });

  it('点完成触发 onCorrect', () => {
    const onCorrect = vi.fn();
    render(<ColoringGame data={data} onCorrect={onCorrect} />);
    fireEvent.click(screen.getByRole('button', { name: '完成' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('选色后色块高亮，点橡皮切到橡皮模式', () => {
    render(<ColoringGame data={data} onCorrect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '颜色#43a047' }));
    expect(screen.getByRole('button', { name: '颜色#43a047' })).toHaveClass('color-swatch-active');
    fireEvent.click(screen.getByRole('button', { name: '橡皮' }));
    expect(screen.getByRole('button', { name: '橡皮' })).toHaveClass('eraser-active');
  });
});
