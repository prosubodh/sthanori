import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg tracking-tight">Sthanori</span>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  ),
});
