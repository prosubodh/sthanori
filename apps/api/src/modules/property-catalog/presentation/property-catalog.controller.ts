import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyResponseDto,
  PropertyWithSpacesResponseDto,
  RentableSpaceResponseDto,
  UpdateSpaceStatusDto,
} from '@sthanori/shared';
import { PropertyCatalogService } from '../application/property-catalog.service';

@Controller('api/v1/properties')
export class PropertyCatalogController {
  constructor(
    @Inject(PropertyCatalogService)
    private readonly service: PropertyCatalogService,
  ) {}

  @Post()
  public async createProperty(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePropertyDto,
  ): Promise<PropertyResponseDto> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.createProperty(effectiveTenantId, dto);
  }

  @Get()
  public async listProperties(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<PropertyResponseDto[]> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.listProperties(effectiveTenantId);
  }

  @Get(':id')
  public async getProperty(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ): Promise<PropertyWithSpacesResponseDto> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.getPropertyById(effectiveTenantId, id);
  }

  @Post(':id/spaces')
  public async createSpace(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') propertyId: string,
    @Body() dto: CreateRentableSpaceDto,
  ): Promise<RentableSpaceResponseDto> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.createSpace(effectiveTenantId, propertyId, dto);
  }

  @Get(':id/spaces')
  public async listSpaces(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') propertyId: string,
  ): Promise<RentableSpaceResponseDto[]> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.listSpaces(effectiveTenantId, propertyId);
  }

  @Patch(':id/spaces/:spaceId/status')
  public async updateSpaceStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') propertyId: string,
    @Param('spaceId') spaceId: string,
    @Body() dto: UpdateSpaceStatusDto,
  ): Promise<RentableSpaceResponseDto> {
    const effectiveTenantId = tenantId || 'default-workspace';
    return this.service.updateSpaceStatus(effectiveTenantId, propertyId, spaceId, dto.status);
  }
}
