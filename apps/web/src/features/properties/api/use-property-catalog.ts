import type { CreatePropertyDto, CreateRentableSpaceDto, SpaceStatus } from '@sthanori/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultPropertyCatalogClient } from './http-property-catalog.client';
import type { IPropertyCatalogApiClient } from './property-catalog.client';

export const PROPERTY_CATALOG_QUERY_KEY = ['properties', 'catalog'];

export function usePropertyCatalog(
  client: IPropertyCatalogApiClient = defaultPropertyCatalogClient,
  tenantId = 'default-workspace',
) {
  return useQuery({
    queryKey: [...PROPERTY_CATALOG_QUERY_KEY, tenantId],
    queryFn: () => client.listPropertiesWithSpaces(tenantId),
  });
}

export function useCreateProperty(
  client: IPropertyCatalogApiClient = defaultPropertyCatalogClient,
  tenantId = 'default-workspace',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePropertyDto) => client.createProperty(dto, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROPERTY_CATALOG_QUERY_KEY, tenantId] });
    },
  });
}

export function useCreateSpace(
  client: IPropertyCatalogApiClient = defaultPropertyCatalogClient,
  tenantId = 'default-workspace',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, dto }: { propertyId: string; dto: CreateRentableSpaceDto }) =>
      client.createSpace(propertyId, dto, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROPERTY_CATALOG_QUERY_KEY, tenantId] });
    },
  });
}

export function useUpdateSpaceStatus(
  client: IPropertyCatalogApiClient = defaultPropertyCatalogClient,
  tenantId = 'default-workspace',
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      spaceId,
      status,
    }: {
      propertyId: string;
      spaceId: string;
      status: SpaceStatus;
    }) => client.updateSpaceStatus(propertyId, spaceId, status, tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROPERTY_CATALOG_QUERY_KEY, tenantId] });
    },
  });
}
