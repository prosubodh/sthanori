import { describe, expect, it } from 'vitest';
import { PropertyAggregate } from './property.aggregate';

describe('PropertyAggregate Domain Root', () => {
  const validAddress = {
    street: '100 Sunset Blvd',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    country: 'USA',
  };

  it('should instantiate a valid property aggregate', () => {
    const property = new PropertyAggregate({
      id: 'prop-1',
      tenantId: 'tenant-123',
      name: 'Sunset Towers',
      propertyType: 'RESIDENTIAL_MULTIFAMILY',
      currency: 'USD',
      address: validAddress,
    });

    expect(property.id).toBe('prop-1');
    expect(property.tenantId).toBe('tenant-123');
    expect(property.name).toBe('Sunset Towers');
    expect(property.propertyType).toBe('RESIDENTIAL_MULTIFAMILY');
    expect(property.currency).toBe('USD');
    expect(property.address).toEqual(validAddress);
  });

  it('should throw when name is empty or whitespace', () => {
    expect(
      () =>
        new PropertyAggregate({
          id: 'prop-1',
          tenantId: 'tenant-123',
          name: '   ',
          propertyType: 'SINGLE_FAMILY',
          currency: 'USD',
          address: validAddress,
        }),
    ).toThrow('Property name cannot be empty');
  });

  it('should update property details and validate constraints', () => {
    const property = new PropertyAggregate({
      id: 'prop-1',
      tenantId: 'tenant-123',
      name: 'Sunset Towers',
      propertyType: 'RESIDENTIAL_MULTIFAMILY',
      currency: 'USD',
      address: validAddress,
    });

    property.updateDetails({
      name: 'Sunset Pinnacle',
      address: { ...validAddress, street: '101 Sunset Blvd' },
    });

    expect(property.name).toBe('Sunset Pinnacle');
    expect(property.address.street).toBe('101 Sunset Blvd');
  });
});
