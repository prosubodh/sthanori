import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';
import { buildSetTenantSessionQuery } from './rls';

describe('PostgreSQL RLS Session Helper', () => {
  it('should build a valid sql query with trimmed tenantId', () => {
    const query = buildSetTenantSessionQuery('  tenant-uuid-123  ');
    expect(query).toBeDefined();
    const dialect = new PgDialect();
    const compiled = dialect.sqlToQuery(query);
    expect(compiled.sql).toContain('SET LOCAL app.current_tenant_id');
    expect(compiled.params).toContain('tenant-uuid-123');
  });

  it('should throw error when tenantId is empty or whitespace', () => {
    expect(() => buildSetTenantSessionQuery('')).toThrow(
      'Tenant ID must not be empty when configuring RLS session',
    );
    expect(() => buildSetTenantSessionQuery('   ')).toThrow(
      'Tenant ID must not be empty when configuring RLS session',
    );
  });
});
