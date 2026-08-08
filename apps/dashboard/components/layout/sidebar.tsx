import Link from 'next/link';
import { Logo } from '@/components/logo';

const links = [
  { href: '/login', label: 'Login' },
  { href: '/classes', label: 'Classes' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/reports', label: 'Reports' },
];

export const Sidebar = () => {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Logo size={28} />
        <span className="text-sm font-semibold">Attendance Tracker</span>
      </div>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className="rounded-md px-2 py-1.5 text-sm hover:bg-muted">
          {link.label}
        </Link>
      ))}
    </nav>
  );
};
