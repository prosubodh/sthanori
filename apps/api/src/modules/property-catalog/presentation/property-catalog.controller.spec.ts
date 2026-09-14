import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PropertyCatalogService } from '../application/property-catalog.service';
import { PropertyCatalogController } from './property-catalog.controller';

describe('PropertyCatalogController (HTTP Presentation)', () => {
  const tenantId = 'tenant-123';
  let serviceMock: PropertyCatalogService;
  let controller: PropertyCatalogController;

  beforeEach(() => {
    serviceMock = {
      createProperty: vi.fn(),
      listProperties: vi.fn(),
      getPropertyById: vi.fn(),
      createSpace: vi.fn(),
      listSpaces: vi.fn(),
      updateSpaceStatus: vi.fn(),
    } as unknown as PropertyCatalogService;

    controller = new PropertyCatalogController(serviceMock);
  });

  it('should create property and return response envelope', async () => {
    const dto = {
      name: 'Test Complex',
      propertyType: 'RESIDENTIAL_MULTIFAMILY' as const,
      currency: 'USD' as const,
      address: {
        street: '123 St',
        city: 'City',
        state: 'State',
        postalCode: '12345',
        country: 'USA',
      },
    };

    const mockCreated = {
      id: 'prop-1',
      tenantId,
      name: 'Test Complex',
      propertyType: 'RESIDENTIAL_MULTIFAMILY' as const,
      currency: 'USD' as const,
      address: dto.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(serviceMock.createProperty).mockResolvedValue(mockCreated);

    const res = await controller.createProperty(tenantId, dto);

    expect(serviceMock.createProperty).toHaveBeenCalledWith(tenantId, dto);
    expect(res).toEqual(mockCreated);
  });

  it('should list properties for tenant', async () => {
    vi.mocked(serviceMock.listProperties).mockResolvedValue([]);

    const res = await controller.listProperties(tenantId);

    expect(serviceMock.listProperties).toHaveBeenCalledWith(tenantId);
    expect(res).toEqual([]);
  });

  it('should create rentable space under property', async () => {
    const spaceDto = {
      spaceNumber: 'Unit 101',
      spaceType: 'WHOLE_APARTMENT' as const,
      floorLevel: 1,
      floorAreaSqFt: 600,
      maxOccupants: 2,
      baseRentAmount: 80000,
    };

    const mockSpace = {
      id: 'space-1',
      propertyId: 'prop-1',
      tenantId,
      ...spaceDto,
      status: 'VACANT' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(serviceMock.createSpace).mockResolvedValue(mockSpace);

    const res = await controller.createSpace(tenantId, 'prop-1', spaceDto);

    expect(serviceMock.createSpace).toHaveBeenCalledWith(tenantId, 'prop-1', spaceDto);
    expect(res).toEqual(mockSpace);
  });

  it('should update space status', async () => {
    const mockSpace = {
      id: 'space-1',
      propertyId: 'prop-1',
      tenantId,
      spaceNumber: 'Unit 101',
      spaceType: 'WHOLE_APARTMENT' as const,
      floorLevel: 1,
      floorAreaSqFt: 600,
      maxOccupants: 2,
      baseRentAmount: 80000,
      status: 'MAINTENANCE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(serviceMock.updateSpaceStatus).mockResolvedValue(mockSpace);

    const res = await controller.updateSpaceStatus(tenantId, 'prop-1', 'space-1', {
      status: 'MAINTENANCE',
    });

    expect(serviceMock.updateSpaceStatus).toHaveBeenCalledWith(
      tenantId,
      'prop-1',
      'space-1',
      'MAINTENANCE',
    );
    expect(res.status).toBe('MAINTENANCE');
  });
});
