import { sql } from 'drizzle-orm';

/**
 * Returns SQL statement to set PostgreSQL session variable for Row-Level Security.
 * Enforces strict non-empty tenant identifier validation.
 */
export function buildSetTenantSessionQuery(tenantId: string) {
  if (!tenantId || tenantId.trim().length === 0) {
    throw new Error('Tenant ID must not be empty when configuring RLS session');
  }
  const cleanTenantId = tenantId.trim();
  return sql`SET LOCAL app.current_tenant_id = ${cleanTenantId}`;
}
