import type {
  CreatePropertyDto,
  CreateRentableSpaceDto,
  PropertyWithSpacesResponseDto,
  SpaceStatus,
} from '@sthanori/shared';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { PropertyCatalogView } from '../features/properties/components/property-catalog-view';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

export function HomeComponent() {
  const [properties, setProperties] = useState<PropertyWithSpacesResponseDto[]>([
    {
      id: 'prop-sample-1',
      tenantId: 'demo-landlord-ws',
      name: 'Kathmandu Residency',
      propertyType: 'RESIDENTIAL_MULTIFAMILY',
      currency: 'NPR',
      address: {
        street: '10 Lazimpat',
        city: 'Kathmandu',
        state: 'Bagmati',
        postalCode: '44600',
        country: 'Nepal',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spaces: [
        {
          id: 'space-101',
          propertyId: 'prop-sample-1',
          tenantId: 'demo-landlord-ws',
          spaceNumber: 'Apt 101',
          buildingBlock: 'Block A',
          spaceType: 'WHOLE_APARTMENT',
          floorLevel: 1,
          floorAreaSqFt: 750,
          maxOccupants: 3,
          baseRentAmount: 3500000,
          status: 'VACANT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'space-102',
          propertyId: 'prop-sample-1',
          tenantId: 'demo-landlord-ws',
          spaceNumber: 'Apt 102',
          buildingBlock: 'Block A',
          spaceType: 'WHOLE_APARTMENT',
          floorLevel: 1,
          floorAreaSqFt: 850,
          maxOccupants: 4,
          baseRentAmount: 4000000,
          status: 'OCCUPIED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ]);

  const handleCreateProperty = (dto: CreatePropertyDto) => {
    const newProp: PropertyWithSpacesResponseDto = {
      id: `prop-${Date.now()}`,
      tenantId: 'demo-landlord-ws',
      name: dto.name,
      propertyType: dto.propertyType,
      currency: dto.currency,
      address: dto.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      spaces: [],
    };
    setProperties((prev) => [newProp, ...prev]);
  };

  const handleCreateSpace = (propertyId: string, dto: CreateRentableSpaceDto) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;
        const newSpace = {
          id: `space-${Date.now()}`,
          propertyId,
          tenantId: 'demo-landlord-ws',
          spaceNumber: dto.spaceNumber,
          buildingBlock: dto.buildingBlock,
          spaceType: dto.spaceType,
          floorLevel: dto.floorLevel,
          floorAreaSqFt: dto.floorAreaSqFt,
          maxOccupants: dto.maxOccupants,
          baseRentAmount: dto.baseRentAmount,
          status: 'VACANT' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...prop,
          spaces: [...prop.spaces, newSpace],
        };
      }),
    );
  };

  const handleUpdateSpaceStatus = (propertyId: string, spaceId: string, status: SpaceStatus) => {
    setProperties((prev) =>
      prev.map((prop) => {
        if (prop.id !== propertyId) return prop;
        return {
          ...prop,
          spaces: prop.spaces.map((space) => (space.id === spaceId ? { ...space, status } : space)),
        };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto pt-8 pb-4 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
          Sthanori Multi-Tenant Platform
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enterprise SaaS platform powered by Hexagonal Architecture, London School TDD, and
          12-Factor cloud-native discipline.
        </p>
      </div>

      <PropertyCatalogView
        properties={properties}
        onCreateProperty={handleCreateProperty}
        onCreateSpace={handleCreateSpace}
        onUpdateSpaceStatus={handleUpdateSpaceStatus}
      />
    </div>
  );
}
