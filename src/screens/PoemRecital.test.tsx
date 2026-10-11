import { render, screen, fireEvent, act } from '@testing-library/react';
import { PoemRecital } from './PoemRecital';
import { useProfilesStore } from '../stores/profiles';
import { useProgressStore } from '../stores/progress';
import type { Poem } from '../content/schema';

const { speakMock, cancelMock } = vi.hoisted(() => ({ speakMock: vi.fn(), cancelMock: vi.fn() }));

vi.mock('../engine/useSpeech', () => ({
  useSpeech: () => ({ speak: speakMock, cancel: cancelMock, supported: true }),
}));

const poem: Poem = {
  id: 'poem-test',
  title: '静夜思',
  author: '李白',
  dynasty: '唐',
  lines: ['床前明月光', '疑是地上霜'],
  familiar: true,
};

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  speakMock.mockClear();
  cancelMock.mockClear();
  useProfilesStore.setState({
    profiles: [{ id: 'p1', name: '小宝', avatar: '🦖', ageBand: '5-6' }],
    activeId: 'p1',
  });
  useProgressStore.setState({ byProfile: {} });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PoemRecital', () => {
  it('挂载时不自动朗读（手势门控）', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    expect(speakMock).not.toHaveBeenCalled();
    expect(screen.getByText('静夜思')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '开始听' })).toBeInTheDocument();
  });

  it('点击开始听后先朗读诗名', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    expect(speakMock).toHaveBeenCalledWith('静夜思');
  });

  it('读完诗名后朗读作者·朝代，再读正文', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    act(() => { vi.advanceTimersByTime(3 * 350); });
    expect(speakMock).toHaveBeenCalledWith('李白，唐');
    act(() => { vi.advanceTimersByTime(3 * 350); });
    expect(speakMock).toHaveBeenCalledWith('床前明月光');
  });

  it('逐字推进，播完触发完成并记录星星', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    act(() => { vi.advanceTimersByTime(16 * 350); });
    expect(screen.getByLabelText('获得星星')).toBeInTheDocument();
    expect(useProgressStore.getState().byProfile['p1']['poem-test']).toMatchObject({ stars: 1 });
  });

  it('停止按钮取消朗读并复位', () => {
    render(<PoemRecital poem={poem} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '开始听' }));
    fireEvent.click(screen.getByRole('button', { name: '停止' }));
    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: '开始听' })).toBeInTheDocument();
  });
});
