import { describe, expect, it } from 'vitest';
import {
  CreatePropertySchema,
  CreateRentableSpaceSchema,
  PropertyTypeEnum,
  SpaceStatusEnum,
  SpaceTypeEnum,
  UpdateSpaceStatusSchema,
} from './property-catalog';

describe('Property & Space Catalog Contracts (Shared Zod Schemas)', () => {
  describe('CreatePropertySchema', () => {
    it('should successfully parse a valid residential property payload', () => {
      const validPayload = {
        name: 'Sunset Heights Apartments',
        propertyType: PropertyTypeEnum.RESIDENTIAL_MULTIFAMILY,
        currency: 'USD',
        address: {
          street: '123 Main Street',
          city: 'Kathmandu',
          state: 'Bagmati',
          postalCode: '44600',
          country: 'Nepal',
        },
      };

      const parsed = CreatePropertySchema.parse(validPayload);
      expect(parsed.name).toBe('Sunset Heights Apartments');
      expect(parsed.propertyType).toBe('RESIDENTIAL_MULTIFAMILY');
      expect(parsed.currency).toBe('USD');
      expect(parsed.address.city).toBe('Kathmandu');
    });

    it('should reject invalid currency codes other than USD or NPR', () => {
      const invalidPayload = {
        name: 'Invalid Currency Property',
        propertyType: PropertyTypeEnum.SINGLE_FAMILY,
        currency: 'EUR',
        address: {
          street: '456 Oak Lane',
          city: 'Lalitpur',
          state: 'Bagmati',
          postalCode: '44700',
          country: 'Nepal',
        },
      };

      expect(() => CreatePropertySchema.parse(invalidPayload)).toThrow();
    });

    it('should reject empty property name or missing address fields', () => {
      const missingName = {
        name: '   ',
        propertyType: PropertyTypeEnum.RESIDENTIAL_MULTIFAMILY,
        currency: 'NPR',
        address: {
          street: '123 St',
          city: 'Pokhara',
          state: 'Gandaki',
          postalCode: '33700',
          country: 'Nepal',
        },
      };

      expect(() => CreatePropertySchema.parse(missingName)).toThrow();
    });
  });

  describe('CreateRentableSpaceSchema', () => {
    it('should successfully parse a valid residential apartment space', () => {
      const validSpace = {
        spaceNumber: 'Apt 4B',
        buildingBlock: 'Tower 1',
        spaceType: SpaceTypeEnum.WHOLE_APARTMENT,
        floorLevel: 4,
        floorAreaSqFt: 850,
        maxOccupants: 4,
        baseRentAmount: 120000, // minor units ($1200.00 / Rs 1200.00)
      };

      const parsed = CreateRentableSpaceSchema.parse(validSpace);
      expect(parsed.spaceNumber).toBe('Apt 4B');
      expect(parsed.floorAreaSqFt).toBe(850);
      expect(parsed.baseRentAmount).toBe(120000);
      expect(parsed.spaceType).toBe('WHOLE_APARTMENT');
    });

    it('should reject non-positive floorAreaSqFt or maxOccupants', () => {
      const invalidSpace = {
        spaceNumber: 'Apt 101',
        floorLevel: 1,
        floorAreaSqFt: 0,
        maxOccupants: -1,
        baseRentAmount: 50000,
      };

      expect(() => CreateRentableSpaceSchema.parse(invalidSpace)).toThrow();
    });

    it('should reject negative baseRentAmount or floating point rent', () => {
      const invalidRent = {
        spaceNumber: 'Apt 102',
        floorLevel: 1,
        floorAreaSqFt: 500,
        maxOccupants: 2,
        baseRentAmount: -500,
      };

      expect(() => CreateRentableSpaceSchema.parse(invalidRent)).toThrow();

      const floatingRent = {
        spaceNumber: 'Apt 102',
        floorLevel: 1,
        floorAreaSqFt: 500,
        maxOccupants: 2,
        baseRentAmount: 500.5,
      };
      expect(() => CreateRentableSpaceSchema.parse(floatingRent)).toThrow();
    });
  });

  describe('UpdateSpaceStatusSchema', () => {
    it('should parse valid operational space statuses', () => {
      expect(UpdateSpaceStatusSchema.parse({ status: SpaceStatusEnum.VACANT })).toEqual({
        status: 'VACANT',
      });
      expect(UpdateSpaceStatusSchema.parse({ status: SpaceStatusEnum.OCCUPIED })).toEqual({
        status: 'OCCUPIED',
      });
      expect(UpdateSpaceStatusSchema.parse({ status: SpaceStatusEnum.MAINTENANCE })).toEqual({
        status: 'MAINTENANCE',
      });
      expect(UpdateSpaceStatusSchema.parse({ status: SpaceStatusEnum.RESERVED })).toEqual({
        status: 'RESERVED',
      });
    });

    it('should reject unrecognized status string', () => {
      expect(() => UpdateSpaceStatusSchema.parse({ status: 'UNKNOWN_STATUS' })).toThrow();
    });
  });
});
