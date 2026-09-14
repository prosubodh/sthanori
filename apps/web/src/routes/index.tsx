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
    <div className="min-h-screen bg-canvas text-main">
      <header className="max-w-6xl mx-auto pt-8 pb-4 px-6 text-center">
        <div className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 mb-3">
          Workspace: {tenantId}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
          Sthanori Multi-Tenant Platform
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enterprise SaaS platform powered by Hexagonal Architecture, London School TDD, and
          12-Factor cloud-native discipline.
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-12">
        {isLoading && (
          <output
            data-testid="property-catalog-skeleton"
            aria-live="polite"
            className="block w-full space-y-6 animate-pulse"
          >
            <div className="h-8 bg-zinc-800/60 rounded-md w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl" />
              <div className="h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl" />
            </div>
            <div className="h-96 bg-zinc-900/50 border border-zinc-800 rounded-xl" />
            <span className="sr-only">Loading properties...</span>
          </output>
        )}

        {error && (
          <div
            role="alert"
            className="p-6 rounded-xl bg-red-950/50 border border-red-800 text-red-200 space-y-4 my-6"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold">⚠️ Connection Error</span>
            </div>
            <p className="text-sm text-red-300">
              {error instanceof Error ? error.message : 'Failed to fetch property catalog'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
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
      </main>
    </div>
  );
}
