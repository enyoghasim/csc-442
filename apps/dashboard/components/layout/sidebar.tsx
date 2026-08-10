import { SidebarNav } from './sidebar-nav';

// Desktop-only fixed sidebar — hidden below md, where mobile-nav.tsx's Sheet takes over.
export const Sidebar = () => {
  return (
    <nav className="hidden w-56 shrink-0 flex-col border-r p-4 md:flex">
      <SidebarNav />
    </nav>
  );
};
