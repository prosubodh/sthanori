import { AggregateRoot } from '../core/aggregate-root';
import type { SpaceStatus, SpaceType } from '../types/property.types';

export interface RentableSpaceProps {
  id: string;
  propertyId: string;
  tenantId: string;
  spaceNumber: string;
  buildingBlock?: string;
  spaceType: SpaceType;
  floorLevel: number;
  floorAreaSqFt: number;
  maxOccupants: number;
  baseRentAmount: number;
  status: SpaceStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class RentableSpaceAggregate extends AggregateRoot<string> {
  private readonly _propertyId: string;
  private _spaceNumber: string;
  private _buildingBlock?: string;
  private readonly _spaceType: SpaceType;
  private _floorLevel: number;
  private _floorAreaSqFt: number;
  private _maxOccupants: number;
  private _baseRentAmount: number;
  private _status: SpaceStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: RentableSpaceProps) {
    super(props.id, props.tenantId);

    if (!props.propertyId || props.propertyId.trim().length === 0) {
      throw new Error('RentableSpace propertyId cannot be empty');
    }
    if (!props.spaceNumber || props.spaceNumber.trim().length === 0) {
      throw new Error('RentableSpace spaceNumber cannot be empty');
    }
    if (props.floorAreaSqFt <= 0) {
      throw new Error('Floor area must be greater than zero');
    }
    if (props.maxOccupants <= 0) {
      throw new Error('Max occupants must be at least 1');
    }
    if (props.baseRentAmount < 0) {
      throw new Error('Base rent amount cannot be negative');
    }

    this._propertyId = props.propertyId;
    this._spaceNumber = props.spaceNumber.trim();
    this._buildingBlock = props.buildingBlock?.trim();
    this._spaceType = props.spaceType;
    this._floorLevel = props.floorLevel;
    this._floorAreaSqFt = props.floorAreaSqFt;
    this._maxOccupants = props.maxOccupants;
    this._baseRentAmount = props.baseRentAmount;
    this._status = props.status;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  public get propertyId(): string {
    return this._propertyId;
  }

  public get spaceNumber(): string {
    return this._spaceNumber;
  }

  public get buildingBlock(): string | undefined {
    return this._buildingBlock;
  }

  public get spaceType(): SpaceType {
    return this._spaceType;
  }

  public get floorLevel(): number {
    return this._floorLevel;
  }

  public get floorAreaSqFt(): number {
    return this._floorAreaSqFt;
  }

  public get maxOccupants(): number {
    return this._maxOccupants;
  }

  public get baseRentAmount(): number {
    return this._baseRentAmount;
  }

  public get status(): SpaceStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public updateStatus(newStatus: SpaceStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  public updateDetails(params: {
    spaceNumber?: string;
    buildingBlock?: string;
    floorLevel?: number;
    floorAreaSqFt?: number;
    maxOccupants?: number;
    baseRentAmount?: number;
  }): void {
    if (params.spaceNumber !== undefined) {
      if (!params.spaceNumber || params.spaceNumber.trim().length === 0) {
        throw new Error('RentableSpace spaceNumber cannot be empty');
      }
      this._spaceNumber = params.spaceNumber.trim();
    }
    if (params.buildingBlock !== undefined) {
      this._buildingBlock = params.buildingBlock.trim();
    }
    if (params.floorLevel !== undefined) {
      this._floorLevel = params.floorLevel;
    }
    if (params.floorAreaSqFt !== undefined) {
      if (params.floorAreaSqFt <= 0) {
        throw new Error('Floor area must be greater than zero');
      }
      this._floorAreaSqFt = params.floorAreaSqFt;
    }
    if (params.maxOccupants !== undefined) {
      if (params.maxOccupants <= 0) {
        throw new Error('Max occupants must be at least 1');
      }
      this._maxOccupants = params.maxOccupants;
    }
    if (params.baseRentAmount !== undefined) {
      if (params.baseRentAmount < 0) {
        throw new Error('Base rent amount cannot be negative');
      }
      this._baseRentAmount = params.baseRentAmount;
    }
    this._updatedAt = new Date();
  }
}
