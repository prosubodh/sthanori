import { describe, expect, it } from 'vitest';
import { AggregateRoot } from './aggregate-root';

class TestOrderAggregate extends AggregateRoot<string> {
  public placeOrder(orderTotal: number): void {
    this.addDomainEvent({
      type: 'OrderPlaced',
      orderId: this.id,
      tenantId: this.tenantId,
      total: orderTotal,
    });
  }
}

describe('AggregateRoot Domain Primitive', () => {
  it('should construct with id and tenantId and expose immutable getters', () => {
    const aggregate = new TestOrderAggregate('order-123', 'tenant-456');

    expect(aggregate.id).toBe('order-123');
    expect(aggregate.tenantId).toBe('tenant-456');
    expect(aggregate.domainEvents).toEqual([]);
  });

  it('should throw an error when id is empty or whitespace', () => {
    expect(() => new TestOrderAggregate('', 'tenant-456')).toThrow(
      'AggregateRoot id must not be empty',
    );
    expect(() => new TestOrderAggregate('   ', 'tenant-456')).toThrow(
      'AggregateRoot id must not be empty',
    );
  });

  it('should throw an error when tenantId is empty or whitespace', () => {
    expect(() => new TestOrderAggregate('order-123', '')).toThrow(
      'AggregateRoot tenantId must not be empty',
    );
    expect(() => new TestOrderAggregate('order-123', '   ')).toThrow(
      'AggregateRoot tenantId must not be empty',
    );
  });

  it('should record, inspect, and clear domain events cleanly', () => {
    const aggregate = new TestOrderAggregate('order-123', 'tenant-456');
    aggregate.placeOrder(99.5);

    expect(aggregate.domainEvents).toHaveLength(1);
    expect(aggregate.domainEvents[0]).toEqual({
      type: 'OrderPlaced',
      orderId: 'order-123',
      tenantId: 'tenant-456',
      total: 99.5,
    });

    const clearedEvents = aggregate.clearDomainEvents();
    expect(clearedEvents).toHaveLength(1);
    expect(aggregate.domainEvents).toHaveLength(0);
  });
});
