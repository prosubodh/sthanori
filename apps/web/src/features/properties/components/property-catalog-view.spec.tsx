import type { PropertyWithSpacesResponseDto } from '@sthanori/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PropertyCatalogView } from './property-catalog-view';

describe('PropertyCatalogView (UI Component)', () => {
  const initialProperties: PropertyWithSpacesResponseDto[] = [
    {
      id: 'prop-1',
      tenantId: 'tenant-1',
      name: 'Kathmandu Heights',
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
          id: 'space-1',
          propertyId: 'prop-1',
          tenantId: 'tenant-1',
          spaceNumber: 'Apt 101',
          buildingBlock: 'Tower A',
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
    },
  ];

  it('should render property catalog header, property card, and spaces list', () => {
    render(
      <PropertyCatalogView
        properties={initialProperties}
        onCreateProperty={vi.fn()}
        onCreateSpace={vi.fn()}
        onUpdateSpaceStatus={vi.fn()}
      />,
    );

    expect(screen.getByText('Property & Space Catalog')).toBeDefined();
    expect(screen.getByText('Kathmandu Heights')).toBeDefined();
    expect(screen.getByText('Apt 101')).toBeDefined();
    expect(screen.getByText('Tower A')).toBeDefined();
    expect(screen.getByText('VACANT')).toBeDefined();
  });

  it('should allow submitting a new property via the form', () => {
    const handleCreateProperty = vi.fn();

    render(
      <PropertyCatalogView
        properties={[]}
        onCreateProperty={handleCreateProperty}
        onCreateSpace={vi.fn()}
        onUpdateSpaceStatus={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Property Name/i), {
      target: { value: 'Pokhara Lakeside Residency' },
    });
    fireEvent.change(screen.getByLabelText(/Street Address/i), {
      target: { value: 'Lakeside 6' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Pokhara' },
    });
    fireEvent.change(screen.getByLabelText(/State\/Province/i), {
      target: { value: 'Gandaki' },
    });
    fireEvent.change(screen.getByLabelText(/Postal Code/i), {
      target: { value: '33700' },
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'Nepal' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Add Property/i }));

    expect(handleCreateProperty).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Pokhara Lakeside Residency',
        currency: 'NPR',
      }),
    );
  });

  it('should trigger space status update when action is clicked', () => {
    const handleUpdateStatus = vi.fn();

    render(
      <PropertyCatalogView
        properties={initialProperties}
        onCreateProperty={vi.fn()}
        onCreateSpace={vi.fn()}
        onUpdateSpaceStatus={handleUpdateStatus}
      />,
    );

    const maintenanceBtn = screen.getByRole('button', { name: /Mark Maintenance/i });
    fireEvent.click(maintenanceBtn);

    expect(handleUpdateStatus).toHaveBeenCalledWith('prop-1', 'space-1', 'MAINTENANCE');
  });
});
