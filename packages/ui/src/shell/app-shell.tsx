import {
  Bell,
  Building,
  Building2,
  Check,
  ChevronDown,
  FileText,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Receipt,
  Search,
  Settings,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '../components/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/dropdown-menu';
import { ThemeToggle } from '../theme/theme-toggle';

export interface WorkspaceTenant {
  id: string;
  name: string;
  slug: string;
  tier: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarUrl?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  active?: boolean;
}

export interface AppShellProps {
  children: React.ReactNode;
  activeTenant?: WorkspaceTenant;
  user?: UserSession;
  breadcrumbs?: string[];
  currentNavId?: string;
  onNavigate?: (id: string, href: string) => void;
  onSwitchTenant?: (tenantId: string) => void;
  availableTenants?: WorkspaceTenant[];
}

const DEFAULT_TENANT: WorkspaceTenant = {
  id: 'tenant-apex-01',
  name: 'Apex Real Estate Holdings',
  slug: 'apex-holdings',
  tier: 'Enterprise',
};

const DEFAULT_USER: UserSession = {
  name: 'Alex Mercer',
  email: 'alex.mercer@apexholdings.com',
  role: 'Property Manager',
  initials: 'AM',
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'properties', label: 'Properties & Spaces', icon: Building2, href: '/', active: true },
  { id: 'units', label: 'Units & Floorplans', icon: LayoutGrid, href: '/units' },
  { id: 'leases', label: 'Leases & Tenancies', icon: FileText, href: '/leases' },
  { id: 'tenants', label: 'Occupants & Tenants', icon: Users, href: '/tenants' },
  { id: 'maintenance', label: 'Maintenance & Orders', icon: Wrench, href: '/maintenance' },
  { id: 'financials', label: 'Financial Ledgers', icon: Receipt, href: '/financials' },
  { id: 'settings', label: 'Workspace Settings', icon: Settings, href: '/settings' },
];

export function AppShell({
  children,
  activeTenant = DEFAULT_TENANT,
  user = DEFAULT_USER,
  breadcrumbs = ['Portfolio', 'Properties & Spaces'],
  currentNavId = 'properties',
  onNavigate,
  onSwitchTenant,
  availableTenants = [
    DEFAULT_TENANT,
    {
      id: 'tenant-downtown-02',
      name: 'Downtown Lofts LLC',
      slug: 'downtown-lofts',
      tier: 'Professional',
    },
    {
      id: 'tenant-metro-03',
      name: 'Metro Commercial Properties',
      slug: 'metro-commercial',
      tier: 'Enterprise',
    },
  ],
}: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string, href: string) => {
    if (onNavigate) {
      onNavigate(id, href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <button
          type="button"
          tabIndex={-1}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden border-none p-0 cursor-default w-full h-full"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out lg:static ${
          isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand & Logo Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20">
              <Building className="h-5 w-5" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50">
                  Sthanori
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Real Estate ERP
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tenant Workspace Switcher */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                  isSidebarCollapsed ? 'justify-center p-2' : ''
                }`}
                title={activeTenant.name}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                    {activeTenant.name.charAt(0)}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="truncate">
                      <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {activeTenant.name}
                      </div>
                      <Badge variant="success" className="text-[10px] px-1.5 py-0 mt-0.5">
                        {activeTenant.tier}
                      </Badge>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableTenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => onSwitchTenant?.(tenant.id)}
                  className="flex items-center justify-between py-2"
                >
                  <div className="truncate">
                    <p className="font-medium text-xs">{tenant.name}</p>
                    <p className="text-[10px] text-slate-400">{tenant.tier}</p>
                  </div>
                  {tenant.id === activeTenant.id && (
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = (currentNavId || 'properties') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id, item.href)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                />
                {!isSidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isSidebarCollapsed && item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div
            className={`flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
              isSidebarCollapsed ? 'justify-center p-1' : ''
            }`}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200">
              {user.initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Layout Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
                  <span
                    className={
                      idx === breadcrumbs.length - 1
                        ? 'font-semibold text-slate-900 dark:text-slate-100'
                        : 'hover:text-slate-900 dark:hover:text-slate-200 transition-colors'
                    }
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar Trigger */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search properties, spaces, leases... (⌘K)"
                className="h-10 w-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Theme Toggle (Light / Dark / System) */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Responsive Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
