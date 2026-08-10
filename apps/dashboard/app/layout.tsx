import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AppShell } from '@/modules/shared/components/app-shell';
import { QueryProvider } from '@/modules/shared/components/query-provider';

// Same family used by apps/mobile (assets/fonts/GoogleSans-*.ttf) — keep both copies in sync.
const googleSans = localFont({
  src: [
    { path: '../assets/fonts/GoogleSans-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-ExtraLight.ttf', weight: '200', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-Light.ttf', weight: '300', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../assets/fonts/GoogleSans-Black.ttf', weight: '900', style: 'normal' },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Attendance Tracker — Dashboard',
  description: 'Lecturer-facing dashboard for the Attendance Tracking System',
};

// Dark by default (no toggle yet) — matches apps/mobile's dark-only theme.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${googleSans.variable} dark h-full antialiased`}>
      <body className="min-h-full">
        <QueryProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
