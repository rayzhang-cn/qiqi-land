import { render, screen } from '@testing-library/react';
import { App } from './App';
import { useProfilesStore } from './stores/profiles';
import { useProgressStore } from './stores/progress';

beforeEach(() => {
  localStorage.clear();
  useProfilesStore.setState({ profiles: [], activeId: null });
  useProgressStore.setState({ byProfile: {} });
});

it('默认显示档案选择屏', () => {
  render(<App />);
  expect(screen.getByLabelText('名字')).toBeInTheDocument();
});