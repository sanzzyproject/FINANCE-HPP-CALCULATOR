'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Calculator } from 'lucide-react';
import { getAllData, Product } from '@/lib/db';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function PrediksiPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [salesVolume, setSalesVolume] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      const prods = await getAllData('products');
      setProducts(prods.filter(p => p.hpp && p.hpp > 0));
    };
    loadData();
  }, []);

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const profitPerUnit = selectedProduct && selectedProduct.hpp ? selectedProduct.price - selectedProduct.hpp : 0;
  const totalProfit = profitPerUnit * salesVolume;
  const totalRevenue = selectedProduct ? selectedProduct.price * salesVolume : 0;
  const totalCost = selectedProduct && selectedProduct.hpp ? selectedProduct.hpp * salesVolume : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  // Generate chart data for simulation
  const simulationData = {
    labels: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => `${v} unit`),
    datasets: [
      {
        label: 'Profit (Rp)',
        data: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => v * profitPerUnit),
        borderColor: 'rgb(16, 185, 129)', // emerald
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Pendapatan (Rp)',
        data: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(v => v * (selectedProduct?.price || 0)),
        borderColor: 'rgb(37, 99, 235)', // blue
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <LineChart className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-900">Simulasi & Prediksi Profit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-slate-500" />
            Kalkulator Simulasi
          </h2>
          
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
                Profit per unit: {formatCurrency(profitPerUnit)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Simulasi Jumlah Terjual</label>
            <input
              type="number"
              value={salesVolume}
              onChange={(e) => setSalesVolume(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {selectedProduct && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Pendapatan</span>
                <span className="font-medium text-blue-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Biaya (HPP)</span>
                <span className="font-medium text-red-600">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-100">
                <span className="text-slate-800">Total Profit</span>
                <span className="text-emerald-600">{formatCurrency(totalProfit)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Grafik Prediksi (0 - 100 unit)</h2>
          
          {selectedProduct ? (
            <div className="h-72">
              <Line 
                data={simulationData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-500 text-center">
              <p>Pilih produk terlebih dahulu untuk melihat grafik prediksi.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
