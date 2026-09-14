import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyResponseDto,
  PropertyWithSpacesResponseDto,
  RentableSpaceResponseDto,
  SpaceStatus,
} from '@sthanori/shared';

export interface IPropertyCatalogApiClient {
  listProperties(tenantId?: string): Promise<PropertyResponseDto[]>;
  listPropertiesWithSpaces(tenantId?: string): Promise<PropertyWithSpacesResponseDto[]>;
  getProperty(id: string, tenantId?: string): Promise<PropertyWithSpacesResponseDto>;
  createProperty(dto: CreatePropertyDto, tenantId?: string): Promise<PropertyResponseDto>;
  createSpace(
    propertyId: string,
    dto: CreateRentableSpaceDto,
    tenantId?: string,
  ): Promise<RentableSpaceResponseDto>;
  updateSpaceStatus(
    propertyId: string,
    spaceId: string,
    status: SpaceStatus,
    tenantId?: string,
  ): Promise<RentableSpaceResponseDto>;
}
