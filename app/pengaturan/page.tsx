'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Trash2, AlertTriangle, User } from 'lucide-react';
import { initDB } from '@/lib/db';

export default function PengaturanPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('businessName');
    if (savedName) {
      setBusinessName(savedName);
    }
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem('businessName', businessName);
    alert('Preferensi berhasil disimpan.');
  };

  const handleClearData = async () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data? Data yang dihapus tidak dapat dikembalikan.')) {
      setIsClearing(true);
      try {
        const db = await initDB();
        if (db) {
          await db.clear('transactions');
          await db.clear('debts');
          await db.clear('products');
          await db.clear('materials');
          alert('Semua data berhasil dihapus.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Failed to clear data', error);
        alert('Gagal menghapus data.');
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Settings className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Preferensi Aplikasi</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bisnis / Toko</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan nama bisnis Anda"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">Nama ini akan ditampilkan di laporan PDF.</p>
            </div>

            <button
              onClick={handleSavePreferences}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Preferensi
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Manajemen Data</h2>
          
          <div className="space-y-6">
            <div className="flex items-start p-4 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-red-800">Hapus Semua Data (Reset)</h3>
                <p className="text-sm text-red-600 mt-1 mb-3">
                  Tindakan ini akan menghapus seluruh data transaksi, hutang, piutang, produk, dan bahan baku dari perangkat ini secara permanen.
                </p>
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isClearing ? 'Menghapus...' : 'Hapus Semua Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
