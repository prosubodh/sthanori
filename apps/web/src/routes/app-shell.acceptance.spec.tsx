import type { PropertyWithSpacesResponseDto } from '@sthanori/shared';
import { AppShell, ThemeProvider } from '@sthanori/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPropertyCatalogApiClient } from '../features/properties/api/in-memory-property-catalog.client';
import { HomeComponent } from './index';

describe('AppShell & Enterprise Theme Integration Acceptance Test', () => {
  let queryClient: QueryClient;
  let client: InMemoryPropertyCatalogApiClient;

  const sampleProperty: PropertyWithSpacesResponseDto = {
    id: 'prop-apex-1',
    tenantId: 'tenant-apex-01',
    name: 'Summit View Apartments',
    propertyType: 'RESIDENTIAL_MULTIFAMILY',
    currency: 'USD',
    address: {
      street: '100 Alpine Way',
      city: 'Denver',
      state: 'Colorado',
      postalCode: '80202',
      country: 'USA',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spaces: [
      {
        id: 'space-101',
        propertyId: 'prop-apex-1',
        tenantId: 'tenant-apex-01',
        spaceNumber: 'Suite 101',
        buildingBlock: 'West Wing',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 1,
        floorAreaSqFt: 850,
        maxOccupants: 2,
        baseRentAmount: 220000, // $2,200.00
        status: 'VACANT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    client = new InMemoryPropertyCatalogApiClient([sampleProperty]);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders enterprise app shell with active tenant, theme toggle, and live catalog data', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AppShell breadcrumbs={['Portfolio', 'Properties & Spaces']} currentNavId="properties">
            <HomeComponent client={client} tenantId="tenant-apex-01" />
          </AppShell>
        </QueryClientProvider>
      </ThemeProvider>,
    );

    // 1. App Shell Elements
    expect(screen.getByText('Sthanori')).toBeDefined();
    expect(screen.getByText('Apex Real Estate Holdings')).toBeDefined();
    expect(screen.getByText('Enterprise')).toBeDefined();
    expect(screen.getAllByText('Properties & Spaces').length).toBeGreaterThanOrEqual(1);

    // 2. Theme Toggle interaction
    const themeBtn = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeBtn).toBeDefined();

    // Toggle from light to dark
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // 3. Catalog Data renders inside AppShell
    await waitFor(() => {
      expect(screen.getByText('Summit View Apartments')).toBeDefined();
      expect(screen.getByText('Suite 101')).toBeDefined();
      expect(screen.getByText('West Wing')).toBeDefined();
      expect(screen.getByText('VACANT')).toBeDefined();
    });
  });
});
