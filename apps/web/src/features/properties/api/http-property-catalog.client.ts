import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyResponseDto,
  PropertyWithSpacesResponseDto,
  RentableSpaceResponseDto,
  SpaceStatus,
} from '@sthanori/shared';
import type { IPropertyCatalogApiClient } from './property-catalog.client';

export class HttpPropertyCatalogApiClient implements IPropertyCatalogApiClient {
  constructor(private readonly baseUrl = '/api/v1/properties') {}

  private async request<T>(
    path: string,
    options: RequestInit = {},
    tenantId = 'default-workspace',
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
      ...(options.headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody?.message || errorBody?.error || `HTTP error ${response.status}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  public async listProperties(tenantId = 'default-workspace'): Promise<PropertyResponseDto[]> {
    return this.request<PropertyResponseDto[]>('', { method: 'GET' }, tenantId);
  }

  public async listPropertiesWithSpaces(
    tenantId = 'default-workspace',
  ): Promise<PropertyWithSpacesResponseDto[]> {
    return this.request<PropertyWithSpacesResponseDto[]>(
      '?includeSpaces=true',
      { method: 'GET' },
      tenantId,
    );
  }

  public async getProperty(
    id: string,
    tenantId = 'default-workspace',
  ): Promise<PropertyWithSpacesResponseDto> {
    return this.request<PropertyWithSpacesResponseDto>(`/${id}`, { method: 'GET' }, tenantId);
  }

  public async createProperty(
    dto: CreatePropertyDto,
    tenantId = 'default-workspace',
  ): Promise<PropertyResponseDto> {
    return this.request<PropertyResponseDto>(
      '',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      tenantId,
    );
  }

  public async createSpace(
    propertyId: string,
    dto: CreateRentableSpaceDto,
    tenantId = 'default-workspace',
  ): Promise<RentableSpaceResponseDto> {
    return this.request<RentableSpaceResponseDto>(
      `/${propertyId}/spaces`,
      {
        method: 'POST',
        body: JSON.stringify(dto),
      },
      tenantId,
    );
  }

  public async updateSpaceStatus(
    propertyId: string,
    spaceId: string,
    status: SpaceStatus,
    tenantId = 'default-workspace',
  ): Promise<RentableSpaceResponseDto> {
    return this.request<RentableSpaceResponseDto>(
      `/${propertyId}/spaces/${spaceId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      tenantId,
    );
  }
}

export const defaultPropertyCatalogClient = new HttpPropertyCatalogApiClient();
