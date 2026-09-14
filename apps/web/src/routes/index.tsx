import type { CreatePropertyDto, CreateRentableSpaceDto, SpaceStatus } from '@sthanori/shared';
import { createFileRoute } from '@tanstack/react-router';
import type { IPropertyCatalogApiClient } from '../features/properties/api/property-catalog.client';
import {
  useCreateProperty,
  useCreateSpace,
  usePropertyCatalog,
  useUpdateSpaceStatus,
} from '../features/properties/api/use-property-catalog';
import { PropertyCatalogView } from '../features/properties/components/property-catalog-view';

export const Route = createFileRoute('/')({
  component: () => <HomeComponent />,
});

interface HomeComponentProps {
  client?: IPropertyCatalogApiClient;
  tenantId?: string;
}

export function HomeComponent({ client, tenantId = 'demo-landlord-ws' }: HomeComponentProps) {
  const { data: properties = [], isLoading, error, refetch } = usePropertyCatalog(client, tenantId);

  const createPropertyMutation = useCreateProperty(client, tenantId);
  const createSpaceMutation = useCreateSpace(client, tenantId);
  const updateSpaceStatusMutation = useUpdateSpaceStatus(client, tenantId);

  const handleCreateProperty = async (dto: CreatePropertyDto) => {
    await createPropertyMutation.mutateAsync(dto);
  };

  const handleCreateSpace = async (propertyId: string, dto: CreateRentableSpaceDto) => {
    await createSpaceMutation.mutateAsync({ propertyId, dto });
  };

  const handleUpdateSpaceStatus = async (
    propertyId: string,
    spaceId: string,
    status: SpaceStatus,
  ) => {
    await updateSpaceStatusMutation.mutateAsync({ propertyId, spaceId, status });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header section maintaining regression tests compatibility */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 mb-2">
          Workspace: {tenantId}
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 dark:text-slate-50">
          Sthanori Multi-Tenant Platform
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Enterprise SaaS platform powered by Hexagonal Architecture, London School TDD, and
          12-Factor cloud-native discipline.
        </p>
      </div>

      {isLoading && (
        <output
          data-testid="property-catalog-skeleton"
          aria-live="polite"
          className="block w-full space-y-6 animate-pulse"
        >
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            <div className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
          </div>
          <div className="h-96 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
          <span className="sr-only">Loading properties...</span>
        </output>
      )}

      {error && (
        <div
          role="alert"
          className="p-6 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 space-y-4 my-6"
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold">⚠️ Connection Error</span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            {error instanceof Error ? error.message : 'Failed to fetch property catalog'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <PropertyCatalogView
          properties={properties}
          onCreateProperty={handleCreateProperty}
          onCreateSpace={handleCreateSpace}
          onUpdateSpaceStatus={handleUpdateSpaceStatus}
        />
      )}
    </div>
  );
}
