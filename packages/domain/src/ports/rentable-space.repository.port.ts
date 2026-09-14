import type { RentableSpaceAggregate } from '../aggregates/rentable-space.aggregate';

export interface IRentableSpaceRepository {
  save(space: RentableSpaceAggregate): Promise<void>;
  findById(tenantId: string, id: string): Promise<RentableSpaceAggregate | null>;
  findByPropertyId(tenantId: string, propertyId: string): Promise<RentableSpaceAggregate[]>;
  delete(tenantId: string, id: string): Promise<void>;
}
