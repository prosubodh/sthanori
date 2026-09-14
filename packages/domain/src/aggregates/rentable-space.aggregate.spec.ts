import { describe, expect, it } from 'vitest';
import { RentableSpaceAggregate } from './rentable-space.aggregate';

describe('RentableSpaceAggregate Domain Root', () => {
  const baseSpaceProps = {
    id: 'space-1',
    propertyId: 'prop-1',
    tenantId: 'tenant-123',
    spaceNumber: 'Apt 4B',
    buildingBlock: 'Building A',
    spaceType: 'WHOLE_APARTMENT' as const,
    floorLevel: 4,
    floorAreaSqFt: 850,
    maxOccupants: 4,
    baseRentAmount: 150000,
    status: 'VACANT' as const,
  };

  it('should instantiate a valid rentable space', () => {
    const space = new RentableSpaceAggregate(baseSpaceProps);

    expect(space.id).toBe('space-1');
    expect(space.propertyId).toBe('prop-1');
    expect(space.tenantId).toBe('tenant-123');
    expect(space.spaceNumber).toBe('Apt 4B');
    expect(space.buildingBlock).toBe('Building A');
    expect(space.floorAreaSqFt).toBe(850);
    expect(space.maxOccupants).toBe(4);
    expect(space.baseRentAmount).toBe(150000);
    expect(space.status).toBe('VACANT');
  });

  it('should reject non-positive floor area or max occupants', () => {
    expect(
      () =>
        new RentableSpaceAggregate({
          ...baseSpaceProps,
          floorAreaSqFt: 0,
        }),
    ).toThrow('Floor area must be greater than zero');

    expect(
      () =>
        new RentableSpaceAggregate({
          ...baseSpaceProps,
          maxOccupants: 0,
        }),
    ).toThrow('Max occupants must be at least 1');
  });

  it('should reject negative base rent amount', () => {
    expect(
      () =>
        new RentableSpaceAggregate({
          ...baseSpaceProps,
          baseRentAmount: -100,
        }),
    ).toThrow('Base rent amount cannot be negative');
  });

  it('should allow valid status transitions', () => {
    const space = new RentableSpaceAggregate(baseSpaceProps);
    expect(space.status).toBe('VACANT');

    space.updateStatus('OCCUPIED');
    expect(space.status).toBe('OCCUPIED');

    space.updateStatus('MAINTENANCE');
    expect(space.status).toBe('MAINTENANCE');
  });

  it('should update space details while enforcing invariants', () => {
    const space = new RentableSpaceAggregate(baseSpaceProps);
    space.updateDetails({
      spaceNumber: 'Apt 4B - Renamed',
      floorAreaSqFt: 900,
      baseRentAmount: 160000,
    });

    expect(space.spaceNumber).toBe('Apt 4B - Renamed');
    expect(space.floorAreaSqFt).toBe(900);
    expect(space.baseRentAmount).toBe(160000);
  });
});
