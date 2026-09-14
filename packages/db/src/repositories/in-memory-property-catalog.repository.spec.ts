import { PropertyAggregate, RentableSpaceAggregate } from '@sthanori/domain';
import { describe, expect, it } from 'vitest';
import {
  InMemoryPropertyRepository,
  InMemoryRentableSpaceRepository,
} from './in-memory-property-catalog.repository';

describe('InMemory Property & Space Catalog Repositories', () => {
  const tenant1 = 'tenant-aaa';
  const tenant2 = 'tenant-bbb';

  describe('InMemoryPropertyRepository', () => {
    it('should save and find property by id scoped to tenantId', async () => {
      const repo = new InMemoryPropertyRepository();
      const prop = new PropertyAggregate({
        id: 'prop-1',
        tenantId: tenant1,
        name: 'Apartment Complex A',
        propertyType: 'RESIDENTIAL_MULTIFAMILY',
        currency: 'USD',
        address: {
          street: '123 Main St',
          city: 'Kathmandu',
          state: 'Bagmati',
          postalCode: '44600',
          country: 'Nepal',
        },
      });

      await repo.save(prop);

      const found = await repo.findById(tenant1, 'prop-1');
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Apartment Complex A');

      // Assert cross-tenant isolation
      const crossTenant = await repo.findById(tenant2, 'prop-1');
      expect(crossTenant).toBeNull();
    });

    it('should list all properties strictly scoped to tenantId', async () => {
      const repo = new InMemoryPropertyRepository();
      const prop1 = new PropertyAggregate({
        id: 'prop-1',
        tenantId: tenant1,
        name: 'Property 1',
        propertyType: 'SINGLE_FAMILY',
        currency: 'USD',
        address: {
          street: '1 St',
          city: 'City',
          state: 'State',
          postalCode: '111',
          country: 'US',
        },
      });
      const prop2 = new PropertyAggregate({
        id: 'prop-2',
        tenantId: tenant2,
        name: 'Property 2',
        propertyType: 'SINGLE_FAMILY',
        currency: 'NPR',
        address: {
          street: '2 St',
          city: 'City',
          state: 'State',
          postalCode: '222',
          country: 'NP',
        },
      });

      await repo.save(prop1);
      await repo.save(prop2);

      const tenant1Props = await repo.findAll(tenant1);
      expect(tenant1Props).toHaveLength(1);
      expect(tenant1Props[0]?.id).toBe('prop-1');

      const tenant2Props = await repo.findAll(tenant2);
      expect(tenant2Props).toHaveLength(1);
      expect(tenant2Props[0]?.id).toBe('prop-2');
    });

    it('should delete a property scoped to tenantId', async () => {
      const repo = new InMemoryPropertyRepository();
      const prop = new PropertyAggregate({
        id: 'prop-1',
        tenantId: tenant1,
        name: 'Property 1',
        propertyType: 'SINGLE_FAMILY',
        currency: 'USD',
        address: {
          street: '1 St',
          city: 'City',
          state: 'State',
          postalCode: '111',
          country: 'US',
        },
      });

      await repo.save(prop);
      await repo.delete(tenant1, 'prop-1');

      const found = await repo.findById(tenant1, 'prop-1');
      expect(found).toBeNull();
    });
  });

  describe('InMemoryRentableSpaceRepository', () => {
    it('should save and find rentable space by id and propertyId scoped to tenant', async () => {
      const repo = new InMemoryRentableSpaceRepository();
      const space = new RentableSpaceAggregate({
        id: 'space-1',
        propertyId: 'prop-1',
        tenantId: tenant1,
        spaceNumber: 'Unit 101',
        buildingBlock: 'Building A',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 1,
        floorAreaSqFt: 600,
        maxOccupants: 2,
        baseRentAmount: 100000,
        status: 'VACANT',
      });

      await repo.save(space);

      const found = await repo.findById(tenant1, 'space-1');
      expect(found).not.toBeNull();
      expect(found?.spaceNumber).toBe('Unit 101');

      // Cross tenant check
      expect(await repo.findById(tenant2, 'space-1')).toBeNull();

      const spaces = await repo.findByPropertyId(tenant1, 'prop-1');
      expect(spaces).toHaveLength(1);
      expect(spaces[0]?.spaceNumber).toBe('Unit 101');

      // Cross tenant property spaces check
      expect(await repo.findByPropertyId(tenant2, 'prop-1')).toHaveLength(0);
    });

    it('should delete rentable space scoped to tenant', async () => {
      const repo = new InMemoryRentableSpaceRepository();
      const space = new RentableSpaceAggregate({
        id: 'space-1',
        propertyId: 'prop-1',
        tenantId: tenant1,
        spaceNumber: 'Unit 101',
        spaceType: 'WHOLE_APARTMENT',
        floorLevel: 1,
        floorAreaSqFt: 600,
        maxOccupants: 2,
        baseRentAmount: 100000,
        status: 'VACANT',
      });

      await repo.save(space);
      await repo.delete(tenant1, 'space-1');
      expect(await repo.findById(tenant1, 'space-1')).toBeNull();
    });
  });
});
