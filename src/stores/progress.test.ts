import { useProgressStore } from './progress';

beforeEach(() => {
  localStorage.clear();
  useProgressStore.setState({ byProfile: {} });
});

describe('useProgressStore', () => {
  it('答对记录星星、attempts 与 correct', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 2);
    expect(useProgressStore.getState().byProfile['p1']['l1']).toEqual({ stars: 2, attempts: 1, correct: 1 });
  });

  it('答错只增加 attempts，不得星', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', false, 0);
    expect(useProgressStore.getState().byProfile['p1']['l1']).toEqual({ stars: 0, attempts: 1, correct: 0 });
  });

  it('星星保留历史最高', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 2);
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(useProgressStore.getState().byProfile['p1']['l1'].stars).toBe(2);
  });

  it('不同档案进度互相隔离', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(useProgressStore.getState().byProfile['p2']).toBeUndefined();
  });

  it('进度持久化到 localStorage', () => {
    useProgressStore.getState().recordAttempt('p1', 'l1', true, 1);
    expect(localStorage.getItem('qiqi-progress')).toContain('l1');
  });
});