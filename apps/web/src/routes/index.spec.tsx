import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeComponent } from './index';

describe('HomeComponent', () => {
  it('should render the platform title and description', () => {
    render(<HomeComponent />);
    expect(screen.getByText('Sthanori Multi-Tenant Platform')).toBeDefined();
    expect(
      screen.getByText(/Enterprise SaaS platform powered by Hexagonal Architecture/i),
    ).toBeDefined();
  });
});
