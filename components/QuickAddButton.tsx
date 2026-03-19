'use client';

import React, { useState } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, Package, Box, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function QuickAddButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/') return null;

  const actions = [
    { name: 'Pemasukan', icon: ArrowDownCircle, href: '/keuangan/pemasukan', color: 'text-emerald-500', bg: 'bg-emerald-100' },
    { name: 'Pengeluaran', icon: ArrowUpCircle, href: '/keuangan/pengeluaran', color: 'text-red-500', bg: 'bg-red-100' },
    { name: 'Penjualan', icon: ShoppingCart, href: '/penjualan', color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'Produk', icon: Package, href: '/produk/daftar', color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Bahan Baku', icon: Box, href: '/produk/bahan-baku', color: 'text-amber-500', bg: 'bg-amber-100' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 flex flex-col-reverse items-end space-y-reverse space-y-3">
          {actions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 group"
            >
              <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                {action.name}
              </span>
              <div className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${action.bg} ${action.color} hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
            </Link>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-transform duration-300 ${isOpen ? 'bg-slate-800 dark:bg-slate-700 rotate-45' : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'}`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
