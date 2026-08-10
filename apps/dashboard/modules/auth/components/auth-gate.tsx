'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCurrentUserQuery } from '../services/auth.query';

const PUBLIC_ROUTES = ['/login'];

// Client-side auth gate — the session lives behind an httpOnly cookie on a separate-port API, so
// there's nothing a Server Component can read here. Mirrors apps/mobile's (auth)/_layout.tsx +
// (app)/_layout.tsx redirect pattern, collapsed into one gate since dashboard doesn't have route
// groups: redirect to /login if there's no user (any route but /login), redirect away from
// /login if a session already exists. Returns null while loading or mid-redirect so there's no
// flash of the wrong screen.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUserQuery();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const shouldRedirectToLogin = !isLoading && !user && !isPublicRoute;
  const shouldRedirectAwayFromLogin = !isLoading && !!user && isPublicRoute;

  useEffect(() => {
    if (shouldRedirectToLogin) router.replace('/login');
    if (shouldRedirectAwayFromLogin) router.replace('/classes');
  }, [shouldRedirectToLogin, shouldRedirectAwayFromLogin, router]);

  if (isLoading || shouldRedirectToLogin || shouldRedirectAwayFromLogin) return null;

  return <>{children}</>;
}
