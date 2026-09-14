import type {
  IPropertyRepository,
  IRentableSpaceRepository,
  PropertyAggregate,
  RentableSpaceAggregate,
} from '@sthanori/domain';

export class InMemoryPropertyRepository implements IPropertyRepository {
  private readonly items = new Map<string, PropertyAggregate>();

  private makeKey(tenantId: string, id: string): string {
    return `${tenantId}:${id}`;
  }

  public async save(property: PropertyAggregate): Promise<void> {
    this.items.set(this.makeKey(property.tenantId, property.id), property);
  }

  public async findById(tenantId: string, id: string): Promise<PropertyAggregate | null> {
    const found = this.items.get(this.makeKey(tenantId, id));
    return found ?? null;
  }

  public async findAll(tenantId: string): Promise<PropertyAggregate[]> {
    const results: PropertyAggregate[] = [];
    for (const prop of this.items.values()) {
      if (prop.tenantId === tenantId) {
        results.push(prop);
      }
    }
    return results;
  }

  public async delete(tenantId: string, id: string): Promise<void> {
    this.items.delete(this.makeKey(tenantId, id));
  }
}

export class InMemoryRentableSpaceRepository implements IRentableSpaceRepository {
  private readonly items = new Map<string, RentableSpaceAggregate>();

  private makeKey(tenantId: string, id: string): string {
    return `${tenantId}:${id}`;
  }

  public async save(space: RentableSpaceAggregate): Promise<void> {
    this.items.set(this.makeKey(space.tenantId, space.id), space);
  }

  public async findById(tenantId: string, id: string): Promise<RentableSpaceAggregate | null> {
    const found = this.items.get(this.makeKey(tenantId, id));
    return found ?? null;
  }

  public async findByPropertyId(
    tenantId: string,
    propertyId: string,
  ): Promise<RentableSpaceAggregate[]> {
    const results: RentableSpaceAggregate[] = [];
    for (const space of this.items.values()) {
      if (space.tenantId === tenantId && space.propertyId === propertyId) {
        results.push(space);
      }
    }
    return results;
  }

  public async delete(tenantId: string, id: string): Promise<void> {
    this.items.delete(this.makeKey(tenantId, id));
  }
}
