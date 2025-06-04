import { render, screen } from '@testing-library/react';
import App from './App';

test('renders boot text', () => {
  render(<App />);
  const bootElement = screen.getByText(/Initializing The Salon/i);
  expect(bootElement).toBeInTheDocument();
});
