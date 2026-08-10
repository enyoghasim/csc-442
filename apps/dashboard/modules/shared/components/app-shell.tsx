'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { AuthGate } from '@/modules/auth/components/auth-gate';

// Wraps every route in AuthGate, and swaps chrome depending on whether we're on the
// unauthenticated /login screen (no sidebar, centered card) or an authenticated page. A client
// component since it needs the current pathname.
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthGate>
      {isLoginPage ? (
        <main className="flex min-h-screen items-center justify-center p-4 sm:p-6">{children}</main>
      ) : (
        // Below md: MobileNav's top bar + full-width content stacked in a column. At md+: row
        // layout with the fixed Sidebar (MobileNav renders nothing there — see its own md:hidden).
        <div className="flex min-h-screen flex-col md:flex-row">
          <MobileNav />
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      )}
    </AuthGate>
  );
}
