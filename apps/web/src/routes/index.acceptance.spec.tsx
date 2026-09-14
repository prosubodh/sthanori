import type { PropertyWithSpacesResponseDto } from '@sthanori/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPropertyCatalogApiClient } from '../features/properties/api/in-memory-property-catalog.client';
import { HomeComponent } from './index';

describe('HomeComponent Outside-In UI Acceptance Test', () => {
  let queryClient: QueryClient;
  let client: InMemoryPropertyCatalogApiClient;

  const sampleProperty: PropertyWithSpacesResponseDto = {
    id: 'prop-1',
    tenantId: 'demo-landlord-ws',
    name: 'Kathmandu Residency',
    propertyType: 'RESIDENTIAL_MULTIFAMILY',
    currency: 'NPR',
    address: {
      street: '10 Lazimpat',
      city: 'Kathmandu',
      state: 'Bagmati',
      postalCode: '44600',
      country: 'Nepal',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    spaces: [
      {
        id: 'space-101',
        propertyId: 'prop-1',
        tenantId: 'demo-landlord-ws',
        spaceNumber: 'Apt 101',
        buildingBlock: 'Block A',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 1,
        floorAreaSqFt: 750,
        maxOccupants: 3,
        baseRentAmount: 3500000,
        status: 'VACANT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    client = new InMemoryPropertyCatalogApiClient([sampleProperty]);
  });

  const renderHome = (testClient = client) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <HomeComponent client={testClient} tenantId="demo-landlord-ws" />
      </QueryClientProvider>,
    );
  };

  it('should render loading skeleton while fetching, then display properties and spaces from API', async () => {
    renderHome();

    // 1. Loading skeleton is shown initially
    expect(screen.getByTestId('property-catalog-skeleton')).toBeDefined();

    // 2. Data renders from API
    // [TEST_AUDIT] Reason: spaceNumber ('Apt 101') and buildingBlock ('Block A') are rendered in separate DOM nodes, not combined into a single string. | Fix: Query for 'Apt 101' and 'Block A' individually.
    await waitFor(() => {
      expect(screen.getByText('Kathmandu Residency')).toBeDefined();
      expect(screen.getByText('Apt 101')).toBeDefined();
      expect(screen.getByText('Block A')).toBeDefined();
      expect(screen.getByText('VACANT')).toBeDefined();
    });
  });

  it('should allow landlord to create a new property and reflect it in the catalog via API', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Kathmandu Residency')).toBeDefined();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText('Property Name'), {
      target: { value: 'Patan Heritage Suites' },
    });
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: 'Jhamsikhel 5' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Lalitpur' },
    });
    // [TEST_AUDIT] Reason: State/Province and Postal Code are required address fields validated by AddressSchema. | Fix: Fill State and Postal Code inputs.
    fireEvent.change(screen.getByLabelText('State/Province'), {
      target: { value: 'Bagmati' },
    });
    fireEvent.change(screen.getByLabelText('Postal Code'), {
      target: { value: '44700' },
    });

    // [TEST_AUDIT] Reason: Button text is "Add Property" rather than "Create Property". | Fix: Query for button name /add property/i.
    fireEvent.click(screen.getByRole('button', { name: /add property/i }));

    await waitFor(() => {
      expect(screen.getByText('Patan Heritage Suites')).toBeDefined();
    });
  });

  it('should allow landlord to add a rentable space to an existing property via API', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Kathmandu Residency')).toBeDefined();
    });

    // Fill space form
    // [TEST_AUDIT] Reason: Space form labels are "Space # / Unit Label", "Building Block (Optional)", and "Base Rent (Cents/Paisa)". | Fix: Use matching accessible labels.
    fireEvent.change(screen.getByLabelText('Space # / Unit Label'), {
      target: { value: 'Apt 201' },
    });
    fireEvent.change(screen.getByLabelText('Building Block (Optional)'), {
      target: { value: 'Block B' },
    });
    fireEvent.change(screen.getByLabelText('Base Rent (Cents/Paisa)'), {
      target: { value: '4500000' },
    });

    // [TEST_AUDIT] Reason: Button text is "Add Space to Selected Property". | Fix: Query for button name /add space to selected property/i.
    fireEvent.click(screen.getByRole('button', { name: /add space to selected property/i }));

    // [TEST_AUDIT] Reason: spaceNumber ('Apt 201') and buildingBlock ('Block B') are in distinct DOM nodes. | Fix: Query for 'Apt 201' and 'Block B' individually.
    await waitFor(() => {
      expect(screen.getByText('Apt 201')).toBeDefined();
      expect(screen.getByText('Block B')).toBeDefined();
    });
  });

  it('should allow landlord to change the status of a rentable space via API', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Apt 101')).toBeDefined();
    });

    // [TEST_AUDIT] Reason: Status changes are rendered as direct action buttons ("Mark Maintenance") rather than a select dropdown. | Fix: Click "Mark Maintenance" button.
    const markMaintenanceBtn = screen.getByRole('button', { name: /mark maintenance/i });
    fireEvent.click(markMaintenanceBtn);

    await waitFor(() => {
      expect(screen.getByText('MAINTENANCE')).toBeDefined();
    });
  });

  it('should render an accessible error alert with retry button on API failure', async () => {
    client.shouldFail = true;
    renderHome();

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeDefined();
      expect(screen.getByText(/Failed to fetch property catalog/i)).toBeDefined();
    });

    // Clicking retry after failure cleared
    client.shouldFail = false;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.getByText('Kathmandu Residency')).toBeDefined();
    });
  });
});
