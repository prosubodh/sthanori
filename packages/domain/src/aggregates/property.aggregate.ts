import { AggregateRoot } from '../core/aggregate-root';
import type { AddressVo, CurrencyCode, PropertyType } from '../types/property.types';

export interface PropertyProps {
  id: string;
  tenantId: string;
  name: string;
  propertyType: PropertyType;
  currency: CurrencyCode;
  address: AddressVo;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PropertyAggregate extends AggregateRoot<string> {
  private _name: string;
  private readonly _propertyType: PropertyType;
  private readonly _currency: CurrencyCode;
  private _address: AddressVo;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: PropertyProps) {
    super(props.id, props.tenantId);

    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Property name cannot be empty');
    }

    this._name = props.name.trim();
    this._propertyType = props.propertyType;
    this._currency = props.currency;
    this._address = { ...props.address };
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get name(): string {
    return this._name;
  }

  public get propertyType(): PropertyType {
    return this._propertyType;
  }

  public get currency(): CurrencyCode {
    return this._currency;
  }

  public get address(): AddressVo {
    return { ...this._address };
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateDetails(params: { name?: string; address?: AddressVo }): void {
    if (params.name !== undefined) {
      if (!params.name || params.name.trim().length === 0) {
        throw new Error('Property name cannot be empty');
      }
      this._name = params.name.trim();
    }
    if (params.address !== undefined) {
      this._address = { ...params.address };
    }
    this._updatedAt = new Date();
  }
}
