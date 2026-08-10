'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOutIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCurrentUserQuery } from '@/modules/auth/services/auth.query';
import { useLogoutMutation } from '@/modules/auth/services/auth.mutation';

const links = [
  { href: '/classes', label: 'Classes' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/reports', label: 'Reports' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: user } = useCurrentUserQuery();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Logo size={28} />
        <span className="text-sm font-semibold">Attendance Tracker</span>
      </div>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn('rounded-md px-2 py-1.5 text-sm hover:bg-muted', pathname.startsWith(link.href) && 'bg-muted font-medium')}
        >
          {link.label}
        </Link>
      ))}

      <div className="mt-auto flex flex-col gap-2 border-t pt-4">
        {user && <span className="truncate px-2 text-xs text-muted-foreground">{user.name}</span>}
        <Button variant="outline" size="sm" className="justify-start gap-2" onClick={() => logout()} disabled={isLoggingOut}>
          <LogOutIcon />
          {isLoggingOut ? 'Logging out...' : 'Log out'}
        </Button>
      </div>
    </nav>
  );
};
