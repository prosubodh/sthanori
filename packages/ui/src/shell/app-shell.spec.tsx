import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from '../theme/theme-provider';
import { AppShell, type UserSession, type WorkspaceTenant } from './app-shell';

const mockTenant: WorkspaceTenant = {
  id: 'tenant-apex-01',
  name: 'Apex Real Estate Holdings',
  slug: 'apex-holdings',
  tier: 'Enterprise',
};

const mockUser: UserSession = {
  name: 'Alex Mercer',
  email: 'alex.mercer@apexholdings.com',
  role: 'Property Manager',
  initials: 'AM',
};

describe('Enterprise App Shell (Design Pro Max)', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders branding, workspace switcher, user profile, and navigation items', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AppShell
          activeTenant={mockTenant}
          user={mockUser}
          breadcrumbs={['Portfolio', 'Properties & Spaces']}
        >
          <div data-testid="dashboard-content">Main Catalog Area</div>
        </AppShell>
      </ThemeProvider>,
    );

    expect(screen.getByText('Sthanori')).toBeDefined();
    expect(screen.getByText('Apex Real Estate Holdings')).toBeDefined();
    expect(screen.getByText('Enterprise')).toBeDefined();
    expect(screen.getByText('Alex Mercer')).toBeDefined();
    expect(screen.getByText('Property Manager')).toBeDefined();
    expect(screen.getAllByText('Properties & Spaces').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('dashboard-content')).toBeDefined();
    expect(screen.getByText('Portfolio')).toBeDefined();
  });

  it('toggles sidebar collapse state on collapse button click', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AppShell activeTenant={mockTenant} user={mockUser}>
          <div>Content</div>
        </AppShell>
      </ThemeProvider>,
    );

    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(collapseBtn).toBeDefined();

    // Click to collapse
    fireEvent.click(collapseBtn);
    const expandBtn = screen.getByRole('button', { name: /expand sidebar/i });
    expect(expandBtn).toBeDefined();

    // Click to expand again
    fireEvent.click(expandBtn);
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeDefined();
  });

  it('renders theme toggle and search placeholder in header', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AppShell activeTenant={mockTenant} user={mockUser}>
          <div>Content</div>
        </AppShell>
      </ThemeProvider>,
    );

    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeDefined();
    expect(screen.getByPlaceholderText(/search properties, spaces, leases/i)).toBeDefined();
  });
});
