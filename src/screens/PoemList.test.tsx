import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoemList } from './PoemList';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';

vi.mock('../content', () => ({
  getPoems: () => [
    { id: 'p1', title: '静夜思', author: '李白', dynasty: '唐', lines: ['床前明月光', '疑是地上霜'], familiar: false },
    { id: 'p2', title: '梅花', author: '王安石', dynasty: '宋', lines: ['墙角数枝梅', '凌寒独自开'], familiar: true },
  ],
}));

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '5-6' }],
    activeId: 'p1',
  });
  useProgressStore.setState({ byProfile: {} });
});

describe('PoemList', () => {
  it('渲染所有诗并标记已会/新学', () => {
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('静夜思')).toBeInTheDocument();
    expect(screen.getByText('梅花')).toBeInTheDocument();
    expect(screen.getByText('已会')).toBeInTheDocument();
    expect(screen.getByText('新学')).toBeInTheDocument();
  });

  it('已会诗排在前面', () => {
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    const cards = screen.getAllByRole('button').filter((b) => b.className.includes('poem-card'));
    expect(cards[0]).toHaveTextContent('梅花');
    expect(cards[1]).toHaveTextContent('静夜思');
  });

  it('点击诗触发 onSelectPoem', async () => {
    const onSelectPoem = vi.fn();
    render(<PoemList onSelectPoem={onSelectPoem} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText('静夜思'));
    expect(onSelectPoem).toHaveBeenCalledWith('p1');
  });

  it('已完成的诗显示星星', () => {
    useProgressStore.setState({ byProfile: { p1: { p1: { stars: 1, attempts: 1, correct: 1 } } } });
    render(<PoemList onSelectPoem={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByLabelText('诗词星星')).toHaveTextContent('⭐');
  });
});
