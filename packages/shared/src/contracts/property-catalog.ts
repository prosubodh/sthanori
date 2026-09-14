import { z } from 'zod';

export const PropertyTypeEnum = {
  RESIDENTIAL_MULTIFAMILY: 'RESIDENTIAL_MULTIFAMILY',
  SINGLE_FAMILY: 'SINGLE_FAMILY',
  CO_LIVING: 'CO_LIVING',
  COMMERCIAL: 'COMMERCIAL',
  MIXED_USE: 'MIXED_USE',
} as const;
export type PropertyType = (typeof PropertyTypeEnum)[keyof typeof PropertyTypeEnum];

export const SpaceTypeEnum = {
  WHOLE_APARTMENT: 'WHOLE_APARTMENT',
  PRIVATE_ROOM: 'PRIVATE_ROOM',
  COMMERCIAL_SUITE: 'COMMERCIAL_SUITE',
} as const;
export type SpaceType = (typeof SpaceTypeEnum)[keyof typeof SpaceTypeEnum];

export const SpaceStatusEnum = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  MAINTENANCE: 'MAINTENANCE',
  RESERVED: 'RESERVED',
} as const;
export type SpaceStatus = (typeof SpaceStatusEnum)[keyof typeof SpaceStatusEnum];

export const CurrencyCodeEnum = {
  USD: 'USD',
  NPR: 'NPR',
} as const;
export type CurrencyCode = (typeof CurrencyCodeEnum)[keyof typeof CurrencyCodeEnum];

export const AddressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required').max(200),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State/Province is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
  country: z.string().trim().min(1, 'Country is required').max(100),
});
export type Address = z.infer<typeof AddressSchema>;

export const CreatePropertySchema = z.object({
  name: z.string().trim().min(1, 'Property name is required').max(100),
  propertyType: z.nativeEnum(PropertyTypeEnum),
  currency: z.nativeEnum(CurrencyCodeEnum).default(CurrencyCodeEnum.USD),
  address: AddressSchema,
});
export type CreatePropertyDto = z.infer<typeof CreatePropertySchema>;

export const CreateRentableSpaceSchema = z.object({
  spaceNumber: z.string().trim().min(1, 'Space number/label is required').max(50),
  buildingBlock: z.string().trim().max(50).optional(),
  spaceType: z.nativeEnum(SpaceTypeEnum).default(SpaceTypeEnum.WHOLE_APARTMENT),
  floorLevel: z.number().int('Floor level must be an integer'),
  floorAreaSqFt: z.number().positive('Floor area must be positive'),
  maxOccupants: z.number().int().positive('Max occupants must be at least 1'),
  baseRentAmount: z
    .number()
    .int('Base rent must be an integer in minor units')
    .nonnegative('Base rent cannot be negative'),
});
export type CreateRentableSpaceDto = z.infer<typeof CreateRentableSpaceSchema>;

export const UpdateSpaceStatusSchema = z.object({
  status: z.nativeEnum(SpaceStatusEnum),
});
export type UpdateSpaceStatusDto = z.infer<typeof UpdateSpaceStatusSchema>;

export interface PropertyResponseDto {
  id: string;
  tenantId: string;
  name: string;
  propertyType: PropertyType;
  currency: CurrencyCode;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface RentableSpaceResponseDto {
  id: string;
  propertyId: string;
  tenantId: string;
  spaceNumber: string;
  buildingBlock?: string;
  spaceType: SpaceType;
  floorLevel: number;
  floorAreaSqFt: number;
  maxOccupants: number;
  baseRentAmount: number;
  status: SpaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyWithSpacesResponseDto extends PropertyResponseDto {
  spaces: RentableSpaceResponseDto[];
}
