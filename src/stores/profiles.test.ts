import { useProfilesStore } from './profiles';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
});

describe('useProfilesStore', () => {
  it('addProfile 添加档案并返回 id', () => {
    const id = useProfilesStore.getState().addProfile({ name: '小宝', avatar: '🦖', ageBand: '3-4' });
    const state = useProfilesStore.getState();
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0]).toMatchObject({ id, name: '小宝', avatar: '🦖', ageBand: '3-4' });
  });

  it('setActive 设置当前档案', () => {
    const id = useProfilesStore.getState().addProfile({ name: '大宝', avatar: '🤖', ageBand: '5-6' });
    useProfilesStore.getState().setActive(id);
    expect(useProfilesStore.getState().activeId).toBe(id);
  });

  it('档案持久化到 localStorage', () => {
    useProfilesStore.getState().addProfile({ name: '小宝', avatar: '🐰', ageBand: '3-4' });
    const raw = localStorage.getItem('qiqi-profiles');
    expect(raw).not.toBeNull();
    expect(raw).toContain('小宝');
  });
});