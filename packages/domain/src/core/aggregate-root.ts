export abstract class AggregateRoot<TId extends string = string> {
  protected readonly _id: TId;
  protected readonly _tenantId: string;
  private readonly _domainEvents: unknown[] = [];

  constructor(id: TId, tenantId: string) {
    if (!id || id.trim().length === 0) {
      throw new Error('AggregateRoot id must not be empty');
    }
    if (!tenantId || tenantId.trim().length === 0) {
      throw new Error('AggregateRoot tenantId must not be empty');
    }
    this._id = id;
    this._tenantId = tenantId;
  }

  public get id(): TId {
    return this._id;
  }

  public get tenantId(): string {
    return this._tenantId;
  }

  protected addDomainEvent(event: unknown): void {
    this._domainEvents.push(event);
  }

  public clearDomainEvents(): unknown[] {
    return this._domainEvents.splice(0, this._domainEvents.length);
  }

  public get domainEvents(): readonly unknown[] {
    return [...this._domainEvents];
  }
}
