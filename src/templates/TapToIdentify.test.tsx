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