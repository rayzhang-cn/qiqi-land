import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArithmeticGame } from './ArithmeticGame';
import type { ArithmeticData } from '../content/schema';

vi.mock('./arithmetic', () => ({
  generateProblem: () => ({ a: 3, b: 5, op: 'add' as const, answer: 8, text: '3 + 5' }),
  generateChoices: () => [6, 8, 9],
}));

const data: ArithmeticData = { op: 'add', maxResult: 10, problemCount: 1 };

describe('ArithmeticGame', () => {
  it('choice 渲染算式与选项', () => {
    render(<ArithmeticGame data={data} mode="choice" onCorrect={vi.fn()} onMistake={vi.fn()} />);
    expect(screen.getByText('3 + 5 = ?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument();
  });

  it('choice 点对触发 onCorrect', async () => {
    const onCorrect = vi.fn();
    render(<ArithmeticGame data={data} mode="choice" onCorrect={onCorrect} onMistake={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '8' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('choice 点错触发 onMistake', async () => {
    const onMistake = vi.fn();
    render(<ArithmeticGame data={data} mode="choice" onCorrect={vi.fn()} onMistake={onMistake} />);
    await userEvent.click(screen.getByRole('button', { name: '6' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
  });

  it('fill 渲染数字键盘，输入正确答案确认后 onCorrect', async () => {
    const onCorrect = vi.fn();
    render(<ArithmeticGame data={data} mode="fill" onCorrect={onCorrect} onMistake={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: '8' }));
    await userEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('fill 输入错误答案触发 onMistake', async () => {
    const onMistake = vi.fn();
    render(<ArithmeticGame data={data} mode="fill" onCorrect={vi.fn()} onMistake={onMistake} />);
    await userEvent.click(screen.getByRole('button', { name: '6' }));
    await userEvent.click(screen.getByRole('button', { name: '确认' }));
    expect(onMistake).toHaveBeenCalledTimes(1);
  });
});
