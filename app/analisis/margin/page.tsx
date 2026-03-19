'use client';

import React, { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import { getAllData, Product } from '@/lib/db';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function MarginPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const prods = await getAllData('products');
      // Only show products with HPP calculated
      setProducts(prods.filter(p => p.hpp && p.hpp > 0));
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const chartData = {
    labels: products.map(p => p.name),
    datasets: [
      {
        label: 'Margin (%)',
        data: products.map(p => {
          if (!p.hpp) return 0;
          return ((p.price - p.hpp) / p.price) * 100;
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Percent className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-900">Analisis Margin Produk</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Grafik Margin Produk</h2>
          {products.length > 0 ? (
            <div className="h-80">
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Margin (%)'
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              Belum ada data produk dengan HPP.
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Detail Margin</h2>
          {products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">Produk</th>
                    <th className="px-4 py-3 text-right">Harga Jual</th>
                    <th className="px-4 py-3 text-right">HPP</th>
                    <th className="px-4 py-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const margin = product.hpp ? ((product.price - product.hpp) / product.price) * 100 : 0;
                    const profit = product.hpp ? product.price - product.hpp : 0;
                    
                    return (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3 text-right">{product.hpp ? formatCurrency(product.hpp) : '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${margin > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {margin.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-500 mt-1">{formatCurrency(profit)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Belum ada data produk dengan HPP. Silakan hitung HPP produk terlebih dahulu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
