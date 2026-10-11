import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChapterSelect } from './ChapterSelect';
import { useProfilesStore } from '../stores/profiles';

vi.mock('../content', () => ({
  // math-ch1 spans both age bands (matches real content); math-ch2 is 5-6 only.
  getChapterLevels: (chapterId: string) =>
    chapterId === 'math-ch1'
      ? [
          { id: 'l1', chapter: 'math-ch1', order: 1, domain: 'math', ageBand: '3-4' },
          { id: 'l3', chapter: 'math-ch1', order: 2, domain: 'math', ageBand: '5-6' },
        ]
      : [{ id: 'l2', chapter: 'math-ch2', order: 1, domain: 'math', ageBand: '5-6' }],
}));

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '5-6' }],
    activeId: 'p1',
  });
});

describe('ChapterSelect', () => {
  it('5-6 岁档显示两个章节', () => {
    render(<ChapterSelect island="math" onSelectChapter={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('数数谷')).toBeInTheDocument();
    expect(screen.getByText('加减工厂')).toBeInTheDocument();
  });

  it('3-4 岁档只显示数数谷（隐藏无匹配关卡的章节）', () => {
    useProfilesStore.setState({
      profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '3-4' }],
      activeId: 'p1',
    });
    render(<ChapterSelect island="math" onSelectChapter={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('数数谷')).toBeInTheDocument();
    expect(screen.queryByText('加减工厂')).not.toBeInTheDocument();
  });

  it('点击章节触发 onSelectChapter', async () => {
    const onSelectChapter = vi.fn();
    render(<ChapterSelect island="math" onSelectChapter={onSelectChapter} onBack={vi.fn()} />);
    await userEvent.click(screen.getByText('加减工厂'));
    expect(onSelectChapter).toHaveBeenCalledWith('math-ch2');
  });
});
