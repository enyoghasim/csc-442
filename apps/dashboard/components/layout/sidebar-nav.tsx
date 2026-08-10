'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Analytics02Icon, Book02Icon, Calendar03Icon, Loading03Icon, Logout03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { useCurrentUserQuery } from '@/modules/auth/services/auth.query';
import { useLogoutMutation } from '@/modules/auth/services/auth.mutation';

const links: { href: string; label: string; icon: IconSvgElement }[] = [
  { href: '/classes', label: 'Classes', icon: Book02Icon },
  { href: '/sessions', label: 'Sessions', icon: Calendar03Icon },
  { href: '/reports', label: 'Reports', icon: Analytics02Icon },
];

// The nav content shared between the desktop fixed sidebar (sidebar.tsx) and the mobile Sheet
// (mobile-nav.tsx) — one source of truth for links, user info, and the logout flow so the two
// chrome variants can't drift apart. `onNavigate` closes the mobile Sheet on link tap; the
// desktop sidebar just doesn't pass it.
export const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname();
  const { data: user } = useCurrentUserQuery();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Logo size={28} />
        <span className="text-sm font-semibold">Attendance Tracker</span>
      </div>

      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-muted',
              active && 'bg-muted font-medium text-primary',
            )}
          >
            <HugeiconsIcon icon={link.icon} size={16} />
            {link.label}
          </Link>
        );
      })}

      <div className="mt-auto flex flex-col gap-2 border-t pt-4">
        {user && <span className="truncate px-2 text-xs text-muted-foreground">{user.name}</span>}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="justify-start gap-2" disabled={isLoggingOut}>
              <HugeiconsIcon icon={isLoggingOut ? Loading03Icon : Logout03Icon} size={16} className={isLoggingOut ? 'animate-spin' : undefined} />
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Log out?</AlertDialogTitle>
              <AlertDialogDescription>You&apos;ll need to sign in again to get back to the dashboard.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => logout()}>
                Log out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
