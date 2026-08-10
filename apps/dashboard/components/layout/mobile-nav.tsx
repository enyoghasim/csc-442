'use client';

import { useState } from 'react';
import { Menu01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav } from './sidebar-nav';

// Top app bar shown only below md, where the fixed sidebar (sidebar.tsx) is hidden — the same
// SidebarNav content lives in a slide-in Sheet instead, triggered by a hamburger button.
export const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between border-b p-3 md:hidden">
      <div className="flex items-center gap-2 px-1">
        <Logo size={24} />
        <span className="text-sm font-semibold">Attendance Tracker</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
};
