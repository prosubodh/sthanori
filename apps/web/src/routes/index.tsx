import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

export function HomeComponent() {
  return (
    <div className="max-w-2xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Sthanori Multi-Tenant Platform
      </h1>
      <p className="mt-4 text-base text-gray-400">
        Enterprise SaaS platform powered by Hexagonal Architecture, London School TDD, and 12-Factor
        cloud-native discipline.
      </p>
    </div>
  );
}
