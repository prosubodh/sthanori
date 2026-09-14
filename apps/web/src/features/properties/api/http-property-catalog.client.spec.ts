import type { CreatePropertyDto, CreateRentableSpaceDto } from '@sthanori/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpPropertyCatalogApiClient } from './http-property-catalog.client';

describe('HttpPropertyCatalogApiClient', () => {
  let client: HttpPropertyCatalogApiClient;
  const originalFetch = global.fetch;

  beforeEach(() => {
    client = new HttpPropertyCatalogApiClient('/api/v1/properties');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('should list properties with spaces via GET ?includeSpaces=true', async () => {
    const mockData = [{ id: 'p1', name: 'Prop 1', spaces: [] }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.listPropertiesWithSpaces('test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties?includeSpaces=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should list properties without spaces via GET', async () => {
    const mockData = [{ id: 'p1', name: 'Prop 1' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.listProperties('test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should get single property by ID via GET /:id', async () => {
    const mockData = { id: 'p1', name: 'Prop 1', spaces: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.getProperty('p1', 'test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties/p1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should create property via POST', async () => {
    const dto: CreatePropertyDto = {
      name: 'Sunrise Villa',
      propertyType: 'SINGLE_FAMILY',
      currency: 'USD',
      address: {
        street: '100 Main St',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
        country: 'USA',
      },
    };
    const mockData = { id: 'p2', ...dto };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.createProperty(dto, 'test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties', {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should create rentable space via POST /:id/spaces', async () => {
    const dto: CreateRentableSpaceDto = {
      spaceNumber: 'Unit 4A',
      spaceType: 'WHOLE_APARTMENT',
      floorLevel: 4,
      floorAreaSqFt: 800,
      maxOccupants: 3,
      baseRentAmount: 200000,
    };
    const mockData = { id: 's1', propertyId: 'p1', ...dto };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.createSpace('p1', dto, 'test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties/p1/spaces', {
      method: 'POST',
      body: JSON.stringify(dto),
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should update space status via PATCH /:id/spaces/:spaceId/status', async () => {
    const mockData = { id: 's1', status: 'MAINTENANCE' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await client.updateSpaceStatus('p1', 's1', 'MAINTENANCE', 'test-tenant');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/properties/p1/spaces/s1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'MAINTENANCE' }),
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': 'test-tenant',
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should throw error when server returns error response with message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Validation failed: Invalid address' }),
    } as unknown as Response);

    await expect(client.listProperties('test-tenant')).rejects.toThrow(
      'Validation failed: Invalid address',
    );
  });

  it('should throw generic HTTP error when server returns error without json body', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    } as unknown as Response);

    await expect(client.listProperties('test-tenant')).rejects.toThrow('HTTP error 502');
  });
});
