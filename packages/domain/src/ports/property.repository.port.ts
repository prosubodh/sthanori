import type { PropertyAggregate } from '../aggregates/property.aggregate';

export interface IPropertyRepository {
  save(property: PropertyAggregate): Promise<void>;
  findById(tenantId: string, id: string): Promise<PropertyAggregate | null>;
  findAll(tenantId: string): Promise<PropertyAggregate[]>;
  delete(tenantId: string, id: string): Promise<void>;
}
