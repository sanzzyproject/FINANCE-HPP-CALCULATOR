'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  CreditCard, 
  Users, 
  Package, 
  Box, 
  Calculator, 
  TrendingUp, 
  Percent, 
  Target, 
  LineChart, 
  FileText, 
  Menu,
  X,
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    title: 'Keuangan',
    items: [
      { title: 'Pemasukan', icon: ArrowDownCircle, href: '/keuangan/pemasukan' },
      { title: 'Pengeluaran', icon: ArrowUpCircle, href: '/keuangan/pengeluaran' },
      { title: 'Hutang', icon: CreditCard, href: '/keuangan/hutang' },
      { title: 'Piutang', icon: Users, href: '/keuangan/piutang' },
    ],
  },
  {
    title: 'Produk & HPP',
    items: [
      { title: 'Produk', icon: Package, href: '/produk/daftar' },
      { title: 'Bahan Baku', icon: Box, href: '/produk/bahan-baku' },
      { title: 'Kalkulator HPP', icon: Calculator, href: '/produk/kalkulator-hpp' },
    ],
  },
  {
    title: 'Analisis Bisnis',
    items: [
      { title: 'Profit', icon: TrendingUp, href: '/analisis/profit' },
      { title: 'Margin', icon: Percent, href: '/analisis/margin' },
      { title: 'Break Even Point', icon: Target, href: '/analisis/bep' },
      { title: 'Prediksi Keuntungan', icon: LineChart, href: '/analisis/prediksi' },
    ],
  },
  {
    title: 'Laporan',
    items: [
      { title: 'Laporan Keuangan', icon: FileText, href: '/laporan/keuangan' },
    ],
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    href: '/pengaturan',
  },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
          <span className="text-xl font-bold text-blue-600">UMKM Pro</span>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuItems.map((section, i) => (
            <div key={i}>
              {section.href ? (
                <Link
                  href={section.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === section.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <section.icon className="w-5 h-5 mr-3" />
                  {section.title}
                </Link>
              ) : (
                <>
                  <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items?.map((item, j) => (
                      <Link
                        key={j}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                          pathname === item.href
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          Developed by SANN404 FORUM
        </div>
      </aside>
    </>
  );
}

import { useTheme } from 'next-themes';
import { Moon, Sun, Search, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAllData, Product, Debt } from '@/lib/db';
import { isBefore, addDays } from 'date-fns';

export function Topbar({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'warning' | 'info'}[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  const checkNotifications = async () => {
    const notifs: {id: string, message: string, type: 'warning' | 'info'}[] = [];
    
    // Check low stock
    const products = await getAllData('products');
    products.forEach(p => {
      if ((p as any).stock !== undefined && (p as any).stock <= 5) {
        notifs.push({
          id: `stock-${p.id}`,
          message: `Stok ${p.name} menipis (${(p as any).stock} tersisa)`,
          type: 'warning'
        });
      }
    });

    // Check upcoming debts
    const debts = await getAllData('debts');
    const unpaidDebts = debts.filter(d => d.status === 'unpaid');
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    unpaidDebts.forEach(d => {
      const dueDate = new Date(d.date); // original db.ts uses date
      if (isBefore(dueDate, nextWeek)) {
        notifs.push({
          id: `debt-${d.id}`,
          message: `${d.type === 'payable' ? 'Hutang' : 'Piutang'} ${d.name} jatuh tempo segera`,
          type: 'warning'
        });
      }
    });

    setNotifications(notifs);
  };

  useEffect(() => {
    setMounted(true);
    checkNotifications();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center px-4 lg:px-8 sticky top-0 z-30 transition-colors">
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden mr-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex items-center">
        <form onSubmit={handleSearch} className="w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari transaksi, produk, dll..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
          />
        </form>
      </div>

      <div className="flex items-center space-x-4 ml-4">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    Tidak ada notifikasi
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <p className="text-sm text-slate-800 dark:text-slate-200">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
}
