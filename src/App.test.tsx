import { render, screen } from '@testing-library/react';
import { App } from './App';

it('渲染应用标题', () => {
  render(<App />);
  expect(screen.getByText('奇奇乐园')).toBeInTheDocument();
});