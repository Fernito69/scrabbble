import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Example test to verify Vitest setup
describe('Vitest Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render a React component', () => {
    const TestComponent = () => <div>Hello Vitest!</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Vitest!')).toBeInTheDocument();
  });
});
