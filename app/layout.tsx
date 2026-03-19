import type {Metadata} from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { ClientLayout } from './ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'UMKM Finance & HPP Calculator',
  description: 'A comprehensive financial management and HPP calculator for MSMEs.',
  manifest: '/manifest.json',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors" suppressHydrationWarning>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
