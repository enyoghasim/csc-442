'use client';

import Link from 'next/link';
import { Analytics02Icon, Book02Icon, Calendar03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUserQuery } from '@/modules/auth/services/auth.query';

const quickLinks: { href: string; label: string; description: string; icon: IconSvgElement }[] = [
  { href: '/classes', label: 'Classes', description: 'Create classes and enroll students', icon: Book02Icon },
  { href: '/sessions', label: 'Sessions', description: 'Schedule sessions and run live check-in', icon: Calendar03Icon },
  { href: '/reports', label: 'Reports', description: 'View and export attendance summaries', icon: Analytics02Icon },
];

export default function Home() {
  const { data: user } = useCurrentUserQuery();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{user ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Pick up where you left off, or jump straight to a section below.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="group">
            <Card className="h-full transition-colors duration-150 group-hover:bg-muted/50">
              <CardContent className="flex flex-col gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-150 group-hover:scale-105">
                  <HugeiconsIcon icon={link.icon} size={18} />
                </div>
                <p className="font-medium">{link.label}</p>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
