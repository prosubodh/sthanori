import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyResponseDto,
  PropertyWithSpacesResponseDto,
  RentableSpaceResponseDto,
  SpaceStatus,
} from '@sthanori/shared';
import type { IPropertyCatalogApiClient } from './property-catalog.client';

export class InMemoryPropertyCatalogApiClient implements IPropertyCatalogApiClient {
  private properties: Map<string, PropertyWithSpacesResponseDto> = new Map();
  public shouldFail = false;
  public failureMessage = 'Network error: Failed to fetch property catalog';

  constructor(initialProperties: PropertyWithSpacesResponseDto[] = []) {
    for (const prop of initialProperties) {
      this.properties.set(prop.id, { ...prop, spaces: [...prop.spaces] });
    }
  }

  private checkFailure(): void {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }
  }

  public async listProperties(tenantId = 'default-workspace'): Promise<PropertyResponseDto[]> {
    this.checkFailure();
    return Array.from(this.properties.values())
      .filter((p) => p.tenantId === tenantId)
      .map(({ spaces, ...rest }) => rest);
  }

  public async listPropertiesWithSpaces(
    tenantId = 'default-workspace',
  ): Promise<PropertyWithSpacesResponseDto[]> {
    this.checkFailure();
    return Array.from(this.properties.values()).filter((p) => p.tenantId === tenantId);
  }

  public async getProperty(
    id: string,
    tenantId = 'default-workspace',
  ): Promise<PropertyWithSpacesResponseDto> {
    this.checkFailure();
    const prop = this.properties.get(id);
    if (!prop || prop.tenantId !== tenantId) {
      throw new Error('Property not found');
    }
    return prop;
  }

  public async createProperty(
    dto: CreatePropertyDto,
    tenantId = 'default-workspace',
  ): Promise<PropertyResponseDto> {
    this.checkFailure();
    const id = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newProp: PropertyWithSpacesResponseDto = {
      id,
      tenantId,
      name: dto.name,
      propertyType: dto.propertyType,
      currency: dto.currency,
      address: dto.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spaces: [],
    };
    this.properties.set(id, newProp);
    const { spaces, ...rest } = newProp;
    return rest;
  }

  public async createSpace(
    propertyId: string,
    dto: CreateRentableSpaceDto,
    tenantId = 'default-workspace',
  ): Promise<RentableSpaceResponseDto> {
    this.checkFailure();
    const prop = this.properties.get(propertyId);
    if (!prop || prop.tenantId !== tenantId) {
      throw new Error('Property not found');
    }

    const spaceId = `space-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSpace: RentableSpaceResponseDto = {
      id: spaceId,
      propertyId,
      tenantId,
      spaceNumber: dto.spaceNumber,
      buildingBlock: dto.buildingBlock,
      spaceType: dto.spaceType,
      floorLevel: dto.floorLevel,
      floorAreaSqFt: dto.floorAreaSqFt,
      maxOccupants: dto.maxOccupants,
      baseRentAmount: dto.baseRentAmount,
      status: 'VACANT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    prop.spaces.push(newSpace);
    return newSpace;
  }

  public async updateSpaceStatus(
    propertyId: string,
    spaceId: string,
    status: SpaceStatus,
    tenantId = 'default-workspace',
  ): Promise<RentableSpaceResponseDto> {
    this.checkFailure();
    const prop = this.properties.get(propertyId);
    if (!prop || prop.tenantId !== tenantId) {
      throw new Error('Property not found');
    }

    const space = prop.spaces.find((s) => s.id === spaceId);
    if (!space) {
      throw new Error('Rentable space not found');
    }

    space.status = status;
    space.updatedAt = new Date().toISOString();
    return space;
  }
}
