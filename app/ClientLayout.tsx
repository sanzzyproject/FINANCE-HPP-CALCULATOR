'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, Topbar } from '../components/Layout';
import { QuickAddButton } from '@/components/QuickAddButton';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from 'next-themes';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  if (pathname === '/') {
    return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className="flex flex-col flex-1 w-0 overflow-hidden lg:pl-64">
          <Topbar setIsOpen={setIsSidebarOpen} />
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
        <QuickAddButton />
      </div>
    </ThemeProvider>
  );
}
