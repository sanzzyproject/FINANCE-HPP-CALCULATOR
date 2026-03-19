'use client';

import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getAllData, Product } from '@/lib/db';
import { BarChart2, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { cn } from '@/components/Layout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ProfitAnalyzerPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allProducts = await getAllData('products');
    setProducts(allProducts);
  };

  // Calculate margins and profits
  const analyzedProducts = products.map(p => {
    const profit = p.hpp ? p.price - p.hpp : 0;
    const margin = p.hpp ? (profit / p.price) * 100 : 0;
    return { ...p, profit, margin };
  }).filter(p => p.hpp); // Only analyze products with HPP

  const sortedByProfit = [...analyzedProducts].sort((a, b) => b.profit - a.profit);
  const sortedByMargin = [...analyzedProducts].sort((a, b) => b.margin - a.margin);

  const topProfitable = sortedByProfit.slice(0, 5);
  const leastProfitable = [...sortedByProfit].reverse().slice(0, 5);
  
  const topMargin = sortedByMargin.slice(0, 5);
  const leastMargin = [...sortedByMargin].reverse().slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const barChartData = {
    labels: topProfitable.map(p => p.name),
    datasets: [
      {
        label: 'Profit per Unit',
        data: topProfitable.map(p => p.profit),
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        borderRadius: 4,
      }
    ]
  };

  const marginChartData = {
    labels: topMargin.map(p => p.name),
    datasets: [
      {
        label: 'Margin (%)',
        data: topMargin.map(p => p.margin),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // emerald
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(139, 92, 246, 0.8)', // violet
          'rgba(245, 158, 11, 0.8)', // amber
          'rgba(239, 68, 68, 0.8)',  // red
        ],
        borderWidth: 0,
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <BarChart2 className="w-6 h-6 mr-2 text-blue-600" />
          Profit Analyzer
        </h1>
      </div>

      {analyzedProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-100">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Belum ada data untuk dianalisis</h3>
          <p className="text-slate-500">Tambahkan produk dan hitung HPP-nya terlebih dahulu.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                Top 5 Profit per Unit
              </h2>
              <div className="h-64">
                <Bar 
                  data={barChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return formatCurrency(context.parsed.y || 0);
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        ticks: {
                          callback: function(value) {
                            return new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(value as number);
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <Percent className="w-5 h-5 mr-2 text-blue-500" />
                Top 5 Margin Tertinggi
              </h2>
              <div className="h-64 flex justify-center">
                <Doughnut 
                  data={marginChartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `${context.label}: ${context.parsed.toFixed(1)}%`;
                          }
                        }
                      }
                    },
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Products */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-emerald-50/50 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                <h2 className="font-semibold text-slate-800">Produk Paling Menguntungkan</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {topProfitable.map((p, i) => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mr-3">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">Margin: {p.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+{formatCurrency(p.profit)}</p>
                      <p className="text-xs text-slate-500">per unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Worst Products */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-red-50/50 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                <h2 className="font-semibold text-slate-800">Produk Kurang Menguntungkan</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {leastProfitable.map((p, i) => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold mr-3">
                        {analyzedProducts.length - i}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">Margin: {p.margin.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold", p.profit > 0 ? "text-slate-700" : "text-red-600")}>
                        {p.profit > 0 ? '+' : ''}{formatCurrency(p.profit)}
                      </p>
                      <p className="text-xs text-slate-500">per unit</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
