'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { AuthGate } from '@/modules/auth/components/auth-gate';

// Wraps every route in AuthGate, and swaps chrome depending on whether we're on the
// unauthenticated /login screen (no sidebar, centered card) or an authenticated page (sidebar +
// content). A client component since it needs the current pathname.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthGate>
      {isLoginPage ? (
        <main className="flex min-h-screen items-center justify-center p-6">{children}</main>
      ) : (
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      )}
    </AuthGate>
  );
}
