import { Module } from '@nestjs/common';
import { InMemoryPropertyRepository, InMemoryRentableSpaceRepository } from '@sthanori/db';
import { PropertyCatalogService } from './application/property-catalog.service';
import { PropertyCatalogController } from './presentation/property-catalog.controller';

export const PROPERTY_REPOSITORY_TOKEN = 'IPropertyRepository';
export const RENTABLE_SPACE_REPOSITORY_TOKEN = 'IRentableSpaceRepository';

@Module({
  controllers: [PropertyCatalogController],
  providers: [
    {
      provide: PROPERTY_REPOSITORY_TOKEN,
      useClass: InMemoryPropertyRepository,
    },
    {
      provide: RENTABLE_SPACE_REPOSITORY_TOKEN,
      useClass: InMemoryRentableSpaceRepository,
    },
    {
      provide: PropertyCatalogService,
      useFactory: (
        propRepo: InMemoryPropertyRepository,
        spaceRepo: InMemoryRentableSpaceRepository,
      ) => new PropertyCatalogService(propRepo, spaceRepo),
      inject: [PROPERTY_REPOSITORY_TOKEN, RENTABLE_SPACE_REPOSITORY_TOKEN],
    },
  ],
  exports: [PropertyCatalogService],
})
export class PropertyCatalogModule {}
