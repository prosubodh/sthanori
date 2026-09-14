import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const properties = pgTable('properties', {
  id: uuid('id').primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: text('name').notNull(),
  propertyType: text('property_type').notNull(),
  currency: text('currency').notNull().default('USD'),
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const rentableSpaces = pgTable('rentable_spaces', {
  id: uuid('id').primaryKey(),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull(),
  spaceNumber: text('space_number').notNull(),
  buildingBlock: text('building_block'),
  spaceType: text('space_type').notNull(),
  floorLevel: integer('floor_level').notNull(),
  floorAreaSqFt: integer('floor_area_sq_ft').notNull(),
  maxOccupants: integer('max_occupants').notNull(),
  baseRentAmount: integer('base_rent_amount').notNull(),
  status: text('status').notNull().default('VACANT'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
