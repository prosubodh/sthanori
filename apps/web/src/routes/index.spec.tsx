import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InMemoryPropertyCatalogApiClient } from '../features/properties/api/in-memory-property-catalog.client';
import { HomeComponent } from './index';

describe('HomeComponent', () => {
  it('should render the platform title and description', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const client = new InMemoryPropertyCatalogApiClient();

    render(
      <QueryClientProvider client={queryClient}>
        <HomeComponent client={client} />
      </QueryClientProvider>,
    );
    expect(screen.getByText('Sthanori Multi-Tenant Platform')).toBeDefined();
    expect(
      screen.getByText(/Enterprise SaaS platform powered by Hexagonal Architecture/i),
    ).toBeDefined();
  });
});
