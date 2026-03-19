'use client';

import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getAllData, Product } from '@/lib/db';

export default function BEPPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [targetLaba, setTargetLaba] = useState<number>(0);
  const [fixedCost, setFixedCost] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const prods = await getAllData('products');
      setProducts(prods.filter(p => p.hpp && p.hpp > 0));
    };
    loadData();
  }, []);

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  
  // BEP Unit = Fixed Cost / (Price - Variable Cost(HPP))
  // Target Unit = (Fixed Cost + Target Laba) / (Price - Variable Cost(HPP))
  
  const profitPerUnit = selectedProduct && selectedProduct.hpp ? selectedProduct.price - selectedProduct.hpp : 0;
  
  const bepUnit = profitPerUnit > 0 ? fixedCost / profitPerUnit : 0;
  const targetUnit = profitPerUnit > 0 ? (fixedCost + targetLaba) / profitPerUnit : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Target className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-900">Break Even Point (BEP) & Target Laba</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Parameter Perhitungan</h2>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Produk</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value) || '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {selectedProduct && selectedProduct.hpp && (
              <p className="text-xs text-slate-500 mt-2">
                Harga Jual: {formatCurrency(selectedProduct.price)} | HPP: {formatCurrency(selectedProduct.hpp)} | Profit/Unit: {formatCurrency(profitPerUnit)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Tetap (Fixed Cost) Bulanan</label>
            <p className="text-xs text-slate-500 mb-2">Contoh: Sewa tempat, gaji karyawan tetap, listrik</p>
            <input
              type="number"
              value={fixedCost}
              onChange={(e) => setFixedCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Laba Bulanan</label>
            <input
              type="number"
              value={targetLaba}
              onChange={(e) => setTargetLaba(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Hasil Analisis</h2>
          
          {selectedProduct ? (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h3 className="text-sm font-medium text-slate-500 mb-1">Titik Impas (Break Even Point)</h3>
                <p className="text-3xl font-bold text-blue-600">{Math.ceil(bepUnit)} <span className="text-lg font-normal text-slate-600">unit</span></p>
                <p className="text-sm text-slate-500 mt-2">
                  Anda harus menjual minimal {Math.ceil(bepUnit)} unit produk ini untuk menutup biaya tetap (tidak rugi dan tidak untung).
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <h3 className="text-sm font-medium text-emerald-700 mb-1">Target Penjualan</h3>
                <p className="text-3xl font-bold text-emerald-600">{Math.ceil(targetUnit)} <span className="text-lg font-normal text-emerald-600">unit</span></p>
                <p className="text-sm text-emerald-700 mt-2">
                  Untuk mencapai target laba {formatCurrency(targetLaba)}, Anda harus menjual {Math.ceil(targetUnit)} unit produk ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-500 text-center">
              <p>Pilih produk terlebih dahulu untuk melihat hasil analisis BEP dan Target Laba.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
