'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/modules/shared/services/query-client';

// Thin client-boundary wrapper so app/layout.tsx (a Server Component) can still render a
// QueryClientProvider around the tree — the provider itself has to run client-side.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
