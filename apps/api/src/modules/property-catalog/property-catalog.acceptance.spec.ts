import { InMemoryPropertyRepository, InMemoryRentableSpaceRepository } from '@sthanori/db';
import { describe, expect, it } from 'vitest';
import { PropertyCatalogService } from './application/property-catalog.service';
import { PropertyCatalogController } from './presentation/property-catalog.controller';

describe('Property Catalog Walking Skeleton Acceptance Test', () => {
  const tenantA = 'tenant-alpha-001';
  const tenantB = 'tenant-beta-002';

  it('should execute full end-to-end user journey for property & space creation with strict multi-tenant isolation', async () => {
    // 1. Composition Root wiring
    const propRepo = new InMemoryPropertyRepository();
    const spaceRepo = new InMemoryRentableSpaceRepository();
    const service = new PropertyCatalogService(propRepo, spaceRepo);
    const controller = new PropertyCatalogController(service);

    // 2. Tenant A creates a residential multifamily property
    const createdPropA = await controller.createProperty(tenantA, {
      name: 'Kathmandu Heights',
      propertyType: 'RESIDENTIAL_MULTIFAMILY',
      currency: 'NPR',
      address: {
        street: 'Lazimpat 10',
        city: 'Kathmandu',
        state: 'Bagmati',
        postalCode: '44600',
        country: 'Nepal',
      },
    });

    expect(createdPropA.id).toBeDefined();
    expect(createdPropA.tenantId).toBe(tenantA);
    expect(createdPropA.name).toBe('Kathmandu Heights');
    expect(createdPropA.currency).toBe('NPR');

    // 3. Tenant A creates rentable spaces inside the property
    const space1 = await controller.createSpace(tenantA, createdPropA.id, {
      spaceNumber: 'Apt 101',
      buildingBlock: 'Block A',
      spaceType: 'WHOLE_APARTMENT',
      floorLevel: 1,
      floorAreaSqFt: 750,
      maxOccupants: 3,
      baseRentAmount: 3500000, // NPR 35,000.00 in paisa
    });

    const space2 = await controller.createSpace(tenantA, createdPropA.id, {
      spaceNumber: 'Apt 102',
      buildingBlock: 'Block A',
      spaceType: 'WHOLE_APARTMENT',
      floorLevel: 1,
      floorAreaSqFt: 900,
      maxOccupants: 4,
      baseRentAmount: 4500000, // NPR 45,000.00 in paisa
    });

    expect(space1.status).toBe('VACANT');
    expect(space2.status).toBe('VACANT');

    // 4. Tenant A updates status of space1 to MAINTENANCE
    const updatedSpace1 = await controller.updateSpaceStatus(tenantA, createdPropA.id, space1.id, {
      status: 'MAINTENANCE',
    });
    expect(updatedSpace1.status).toBe('MAINTENANCE');

    // 5. Tenant A retrieves property details including spaces
    const propDetails = await controller.getProperty(tenantA, createdPropA.id);
    expect(propDetails.spaces).toHaveLength(2);
    expect(propDetails.spaces.find((s) => s.id === space1.id)?.status).toBe('MAINTENANCE');
    expect(propDetails.spaces.find((s) => s.id === space2.id)?.status).toBe('VACANT');

    // 6. Multi-Tenant Row Isolation Verification:
    // Tenant B queries properties or spaces and must see ZERO records from Tenant A
    const tenantBProps = await controller.listProperties(tenantB);
    expect(tenantBProps).toHaveLength(0);

    await expect(controller.getProperty(tenantB, createdPropA.id)).rejects.toThrow(
      'Property not found',
    );
    await expect(controller.listSpaces(tenantB, createdPropA.id)).rejects.toThrow(
      'Property not found',
    );
  });
});
