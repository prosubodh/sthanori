import { AppShell } from '@sthanori/ui';
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <AppShell breadcrumbs={['Portfolio', 'Properties & Spaces']} currentNavId="properties">
      <Outlet />
    </AppShell>
  ),
});
