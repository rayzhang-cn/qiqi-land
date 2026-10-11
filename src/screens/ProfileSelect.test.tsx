import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelect } from './ProfileSelect';
import { useProfilesStore } from '../stores/profiles';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
});

describe('ProfileSelect', () => {
  it('创建档案并进入', async () => {
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.type(screen.getByLabelText('名字'), '小宝');
    await userEvent.click(screen.getByRole('button', { name: '5-6岁' }));
    await userEvent.click(screen.getByRole('button', { name: '开始玩' }));
    const state = useProfilesStore.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0]).toMatchObject({ name: '小宝', ageBand: '5-6' });
    expect(state.activeId).toBe(state.profiles[0].id);
    expect(onEnter).toHaveBeenCalled();
  });

  it('名字为空时不能创建', async () => {
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.click(screen.getByRole('button', { name: '开始玩' }));
    expect(useProfilesStore.getState().profiles).toHaveLength(0);
    expect(onEnter).not.toHaveBeenCalled();
  });

  it('点击已有档案直接进入', async () => {
    useProfilesStore.setState({
      profiles: [{ id: 'p1', name: '大宝', avatar: '🤖', ageBand: '5-6' }],
      activeId: null,
    });
    const onEnter = vi.fn();
    render(<ProfileSelect onEnter={onEnter} />);
    await userEvent.click(screen.getByRole('button', { name: /大宝/ }));
    expect(useProfilesStore.getState().activeId).toBe('p1');
    expect(onEnter).toHaveBeenCalled();
  });
});