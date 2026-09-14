export type PropertyType =
  | 'RESIDENTIAL_MULTIFAMILY'
  | 'SINGLE_FAMILY'
  | 'CO_LIVING'
  | 'COMMERCIAL'
  | 'MIXED_USE';

export type SpaceType = 'WHOLE_APARTMENT' | 'PRIVATE_ROOM' | 'COMMERCIAL_SUITE';

export type SpaceStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export type CurrencyCode = 'USD' | 'NPR';

export interface AddressVo {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly postalCode: string;
  readonly country: string;
}
