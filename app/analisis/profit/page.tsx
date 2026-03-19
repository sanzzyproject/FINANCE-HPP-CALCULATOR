'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { getAllData, Transaction } from '@/lib/db';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
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

export default function ProfitPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
    setIsMounted(true);
    const loadData = async () => {
      const txs = await getAllData('transactions');
      setTransactions(txs);
    };
    loadData();
  }, []);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-64">Memuat profit...</div>;
  }

  const [year, month] = selectedMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const filteredTxs = transactions.filter(tx => {
    const txDate = parseISO(tx.date);
    return isWithinInterval(txDate, { start: monthStart, end: monthEnd });
  });

  const totalIncome = filteredTxs
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTxs
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const profit = totalIncome - totalExpense;

  // Chart data
  const chartData = {
    labels: ['Pemasukan', 'Pengeluaran', 'Profit'],
    datasets: [
      {
        label: 'Jumlah (Rp)',
        data: [totalIncome, totalExpense, profit],
        backgroundColor: [
          'rgba(37, 99, 235, 0.8)', // blue
          'rgba(220, 38, 38, 0.8)', // red
          profit >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(220, 38, 38, 0.8)', // emerald or red
        ],
      },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-slate-900">Analisis Profit</h1>
        </div>
        
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pemasukan</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ArrowDownCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <ArrowUpCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profit Bersih</p>
              <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <TrendingUp className={`w-6 h-6 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Grafik Profit {format(date, 'MMMM yyyy', { locale: id })}</h2>
        <div className="h-80">
          <Bar 
            data={chartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
}
