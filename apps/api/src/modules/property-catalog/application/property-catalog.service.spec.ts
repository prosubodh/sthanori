import { PropertyAggregate, RentableSpaceAggregate } from '@sthanori/domain';
import type { IPropertyRepository, IRentableSpaceRepository } from '@sthanori/domain';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PropertyCatalogService } from './property-catalog.service';

describe('PropertyCatalogService (Application Use Cases)', () => {
  const tenantId = 'tenant-xyz';
  let propertyRepoMock: IPropertyRepository;
  let spaceRepoMock: IRentableSpaceRepository;
  let service: PropertyCatalogService;

  beforeEach(() => {
    propertyRepoMock = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    spaceRepoMock = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(null),
      findByPropertyId: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    service = new PropertyCatalogService(propertyRepoMock, spaceRepoMock);
  });

  describe('createProperty', () => {
    it('should create a new property aggregate, save via repository port, and return DTO', async () => {
      const dto = {
        name: 'Kathmandu Residency',
        propertyType: 'RESIDENTIAL_MULTIFAMILY' as const,
        currency: 'NPR' as const,
        address: {
          street: 'Lazimpat Rd',
          city: 'Kathmandu',
          state: 'Bagmati',
          postalCode: '44600',
          country: 'Nepal',
        },
      };

      const result = await service.createProperty(tenantId, dto);

      expect(result.id).toBeDefined();
      expect(result.tenantId).toBe(tenantId);
      expect(result.name).toBe('Kathmandu Residency');
      expect(result.currency).toBe('NPR');
      expect(propertyRepoMock.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('listProperties', () => {
    it('should query repository port with tenantId and return mapped DTOs', async () => {
      const prop = new PropertyAggregate({
        id: 'prop-1',
        tenantId,
        name: 'Sunrise Apartments',
        propertyType: 'RESIDENTIAL_MULTIFAMILY',
        currency: 'USD',
        address: {
          street: '123 Sunset Way',
          city: 'Dallas',
          state: 'TX',
          postalCode: '75001',
          country: 'USA',
        },
      });
      vi.mocked(propertyRepoMock.findAll).mockResolvedValue([prop]);

      const list = await service.listProperties(tenantId);

      expect(propertyRepoMock.findAll).toHaveBeenCalledWith(tenantId);
      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe('prop-1');
      expect(list[0]?.name).toBe('Sunrise Apartments');
    });

    it('should query spaces for each property and return PropertyWithSpacesResponseDto', async () => {
      const prop = new PropertyAggregate({
        id: 'prop-1',
        tenantId,
        name: 'Sunrise Apartments',
        propertyType: 'RESIDENTIAL_MULTIFAMILY',
        currency: 'USD',
        address: {
          street: '123 Sunset Way',
          city: 'Dallas',
          state: 'TX',
          postalCode: '75001',
          country: 'USA',
        },
      });
      const space = new RentableSpaceAggregate({
        id: 'space-1',
        propertyId: 'prop-1',
        tenantId,
        spaceNumber: '101',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 1,
        floorAreaSqFt: 600,
        maxOccupants: 2,
        baseRentAmount: 150000,
        status: 'VACANT',
      });
      vi.mocked(propertyRepoMock.findAll).mockResolvedValue([prop]);
      vi.mocked(spaceRepoMock.findByPropertyId).mockResolvedValue([space]);

      const list = await service.listPropertiesWithSpaces(tenantId);

      expect(propertyRepoMock.findAll).toHaveBeenCalledWith(tenantId);
      expect(spaceRepoMock.findByPropertyId).toHaveBeenCalledWith(tenantId, 'prop-1');
      expect(list).toHaveLength(1);
      expect(list[0]?.spaces).toHaveLength(1);
      expect(list[0]?.spaces[0]?.id).toBe('space-1');
    });
  });

  describe('createSpace', () => {
    it('should throw NotFoundException if property does not exist in workspace', async () => {
      vi.mocked(propertyRepoMock.findById).mockResolvedValue(null);

      await expect(
        service.createSpace(tenantId, 'non-existent-prop', {
          spaceNumber: '101',
          spaceType: 'WHOLE_APARTMENT',
          floorLevel: 1,
          floorAreaSqFt: 500,
          maxOccupants: 2,
          baseRentAmount: 50000,
        }),
      ).rejects.toThrow('Property not found');
    });

    it('should create space aggregate, save to port, and return DTO', async () => {
      const prop = new PropertyAggregate({
        id: 'prop-1',
        tenantId,
        name: 'Sunrise Apartments',
        propertyType: 'RESIDENTIAL_MULTIFAMILY',
        currency: 'USD',
        address: {
          street: '123 Sunset Way',
          city: 'Dallas',
          state: 'TX',
          postalCode: '75001',
          country: 'USA',
        },
      });
      vi.mocked(propertyRepoMock.findById).mockResolvedValue(prop);

      const result = await service.createSpace(tenantId, 'prop-1', {
        spaceNumber: 'Apt 201',
        buildingBlock: 'Building 2',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 2,
        floorAreaSqFt: 750,
        maxOccupants: 3,
        baseRentAmount: 110000,
      });

      expect(result.id).toBeDefined();
      expect(result.propertyId).toBe('prop-1');
      expect(result.spaceNumber).toBe('Apt 201');
      expect(result.status).toBe('VACANT');
      expect(spaceRepoMock.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSpaceStatus', () => {
    it('should update space status and persist', async () => {
      const space = new RentableSpaceAggregate({
        id: 'space-1',
        propertyId: 'prop-1',
        tenantId,
        spaceNumber: 'Apt 201',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 2,
        floorAreaSqFt: 750,
        maxOccupants: 3,
        baseRentAmount: 110000,
        status: 'VACANT',
      });
      vi.mocked(spaceRepoMock.findById).mockResolvedValue(space);

      const updated = await service.updateSpaceStatus(tenantId, 'prop-1', 'space-1', 'MAINTENANCE');

      expect(updated.status).toBe('MAINTENANCE');
      expect(spaceRepoMock.save).toHaveBeenCalledTimes(1);
    });

    it('should throw if space belongs to another property or does not exist', async () => {
      vi.mocked(spaceRepoMock.findById).mockResolvedValue(null);

      await expect(
        service.updateSpaceStatus(tenantId, 'prop-1', 'space-999', 'OCCUPIED'),
      ).rejects.toThrow('Rentable space not found');
    });
  });
});
