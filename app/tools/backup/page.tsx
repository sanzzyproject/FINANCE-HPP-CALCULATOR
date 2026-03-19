'use client';

import React, { useState } from 'react';
import { Download, Upload, Database, FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { getAllData, addData, clearAllData } from '@/lib/db';

export default function BackupPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // EXPORT JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = {
        transactions: await getAllData('transactions'),
        debts: await getAllData('debts'),
        products: await getAllData('products'),
        materials: await getAllData('materials'),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `umkm-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Gagal mengekspor data.');
    } finally {
      setIsExporting(false);
    }
  };

  // IMPORT JSON
  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('PERINGATAN: Import data akan MENGHAPUS semua data saat ini dan menggantinya dengan data dari file backup. Lanjutkan?')) {
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate structure roughly
      if (!data.transactions) {
        throw new Error('Format file tidak valid. Kehilangan data transactions.');
      }

      // Import all stores sequentially to avoid transaction issues
      const stores = ['transactions', 'debts', 'products', 'materials', 'sales', 'stock_movements'] as const;
      
      for (const store of stores) {
        await clearAllData(store);
        if (data[store] && Array.isArray(data[store])) {
          for (const item of data[store]) {
            await addData(store, item);
          }
        }
      }

      alert('Data berhasil diimpor!');
      window.location.reload(); // Reload to refresh all state
    } catch (error) {
      console.error('Import failed:', error);
      alert('Gagal mengimpor data. Pastikan file backup valid.');
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Backup & Restore Data
        </h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
        <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-blue-800">Informasi Penting</h3>
          <p className="mt-1 text-sm text-blue-700">
            Data aplikasi ini disimpan secara lokal di browser perangkat Anda (IndexedDB). 
            Sangat disarankan untuk melakukan backup secara berkala untuk mencegah kehilangan data jika browser dibersihkan atau perangkat rusak.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Export Data (Backup)</h2>
          <p className="text-slate-500 text-sm mb-6 flex-1">
            Unduh seluruh data aplikasi Anda (semua usaha, transaksi, produk, dll) ke dalam satu file JSON. Simpan file ini di tempat yang aman.
          </p>
          
          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
          >
            <FileJson className="w-5 h-5 mr-2" />
            {isExporting ? 'Mengekspor...' : 'Download Backup (JSON)'}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Import Data (Restore)</h2>
          <p className="text-slate-500 text-sm mb-6 flex-1">
            Pulihkan data dari file backup JSON yang pernah Anda unduh sebelumnya. 
            <strong className="text-red-500 block mt-1">Peringatan: Data saat ini akan ditimpa!</strong>
          </p>
          
          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              disabled={isImporting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <button
              disabled={isImporting}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              <FileJson className="w-5 h-5 mr-2" />
              {isImporting ? 'Mengimpor...' : 'Pilih File Backup (JSON)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
