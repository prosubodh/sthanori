import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyAggregate, RentableSpaceAggregate } from '@sthanori/domain';
import type { IPropertyRepository, IRentableSpaceRepository } from '@sthanori/domain';
import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyResponseDto,
  PropertyWithSpacesResponseDto,
  RentableSpaceResponseDto,
  SpaceStatus,
} from '@sthanori/shared';

@Injectable()
export class PropertyCatalogService {
  constructor(
    private readonly propertyRepo: IPropertyRepository,
    private readonly spaceRepo: IRentableSpaceRepository,
  ) {}

  public async createProperty(
    tenantId: string,
    dto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    const id = randomUUID();
    const property = new PropertyAggregate({
      id,
      tenantId,
      name: dto.name,
      propertyType: dto.propertyType,
      currency: dto.currency,
      address: dto.address,
    });

    await this.propertyRepo.save(property);
    return this.mapPropertyToDto(property);
  }

  public async listProperties(tenantId: string): Promise<PropertyResponseDto[]> {
    const properties = await this.propertyRepo.findAll(tenantId);
    return properties.map((prop) => this.mapPropertyToDto(prop));
  }

  public async getPropertyById(
    tenantId: string,
    id: string,
  ): Promise<PropertyWithSpacesResponseDto> {
    const property = await this.propertyRepo.findById(tenantId, id);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const spaces = await this.spaceRepo.findByPropertyId(tenantId, id);
    return {
      ...this.mapPropertyToDto(property),
      spaces: spaces.map((space) => this.mapSpaceToDto(space)),
    };
  }

  public async createSpace(
    tenantId: string,
    propertyId: string,
    dto: CreateRentableSpaceDto,
  ): Promise<RentableSpaceResponseDto> {
    const property = await this.propertyRepo.findById(tenantId, propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const spaceId = randomUUID();
    const space = new RentableSpaceAggregate({
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
    });

    await this.spaceRepo.save(space);
    return this.mapSpaceToDto(space);
  }

  public async listSpaces(
    tenantId: string,
    propertyId: string,
  ): Promise<RentableSpaceResponseDto[]> {
    const property = await this.propertyRepo.findById(tenantId, propertyId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const spaces = await this.spaceRepo.findByPropertyId(tenantId, propertyId);
    return spaces.map((space) => this.mapSpaceToDto(space));
  }

  public async updateSpaceStatus(
    tenantId: string,
    propertyId: string,
    spaceId: string,
    status: SpaceStatus,
  ): Promise<RentableSpaceResponseDto> {
    const space = await this.spaceRepo.findById(tenantId, spaceId);
    if (!space || space.propertyId !== propertyId) {
      throw new NotFoundException('Rentable space not found');
    }

    space.updateStatus(status);
    await this.spaceRepo.save(space);
    return this.mapSpaceToDto(space);
  }

  private mapPropertyToDto(prop: PropertyAggregate): PropertyResponseDto {
    return {
      id: prop.id,
      tenantId: prop.tenantId,
      name: prop.name,
      propertyType: prop.propertyType,
      currency: prop.currency,
      address: prop.address,
      createdAt: prop.createdAt.toISOString(),
      updatedAt: prop.updatedAt.toISOString(),
    };
  }

  private mapSpaceToDto(space: RentableSpaceAggregate): RentableSpaceResponseDto {
    return {
      id: space.id,
      propertyId: space.propertyId,
      tenantId: space.tenantId,
      spaceNumber: space.spaceNumber,
      buildingBlock: space.buildingBlock,
      spaceType: space.spaceType,
      floorLevel: space.floorLevel,
      floorAreaSqFt: space.floorAreaSqFt,
      maxOccupants: space.maxOccupants,
      baseRentAmount: space.baseRentAmount,
      status: space.status,
      createdAt: space.createdAt.toISOString(),
      updatedAt: space.updatedAt.toISOString(),
    };
  }
}
