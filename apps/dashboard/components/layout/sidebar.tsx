import { SidebarNav } from './sidebar-nav';

// Desktop-only fixed sidebar — hidden below md, where mobile-nav.tsx's Sheet takes over.
// `md:sticky md:top-0 md:h-screen` pins it to the viewport regardless of how tall `<main>`'s
// content gets (a long attendance table shouldn't scroll the nav away with it); its own
// `overflow-y-auto` covers the (currently unlikely) case where the nav itself outgrows the
// viewport.
export const Sidebar = () => {
  return (
    <nav className="hidden w-56 shrink-0 flex-col border-r p-4 md:flex md:sticky md:top-0 md:h-screen md:overflow-y-auto">
      <SidebarNav />
    </nav>
  );
};
