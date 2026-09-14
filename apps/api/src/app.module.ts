import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PropertyCatalogModule } from './modules/property-catalog/property-catalog.module';

@Module({
  imports: [PropertyCatalogModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
