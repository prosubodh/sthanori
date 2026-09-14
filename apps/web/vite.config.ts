import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      routeFileIgnorePattern: '.*\\.(spec|test)\\.(ts|tsx)$',
    }),
    react(),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
});
