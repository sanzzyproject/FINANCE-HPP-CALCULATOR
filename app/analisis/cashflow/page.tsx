'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getAllData, Transaction } from '@/lib/db';
import { Activity, ArrowDownCircle, ArrowUpCircle, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function CashflowAnalysisPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSelectedMonth(new Date());
    loadData();
  }, []);

  const loadData = async () => {
    const allTxs = await getAllData('transactions');
    setTransactions(allTxs);
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-64">Memuat arus kas...</div>;
  }

  const currentMonthTxs = transactions.filter(tx => isSameMonth(parseISO(tx.date), selectedMonth));

  const totalIncome = currentMonthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = currentMonthTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const netCashflow = totalIncome - totalExpense;

  // Daily Data for Line Chart
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  });

  const dailyIncome = daysInMonth.map(day => {
    return currentMonthTxs
      .filter(tx => tx.type === 'income' && parseISO(tx.date).getDate() === day.getDate())
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const dailyExpense = daysInMonth.map(day => {
    return currentMonthTxs
      .filter(tx => tx.type === 'expense' && parseISO(tx.date).getDate() === day.getDate())
      .reduce((sum, tx) => sum + tx.amount, 0);
  });

  const dailyNet = daysInMonth.map((day, index) => dailyIncome[index] - dailyExpense[index]);

  const lineChartData = {
    labels: daysInMonth.map(d => format(d, 'dd MMM', { locale: id })),
    datasets: [
      {
        label: 'Pemasukan',
        data: dailyIncome,
        borderColor: 'rgb(16, 185, 129)', // emerald-500
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Pengeluaran',
        data: dailyExpense,
        borderColor: 'rgb(239, 68, 68)', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const barChartData = {
    labels: daysInMonth.map(d => format(d, 'dd MMM', { locale: id })),
    datasets: [
      {
        label: 'Net Cashflow',
        data: dailyNet,
        backgroundColor: dailyNet.map(val => val >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
        borderRadius: 4,
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-600" />
          Cashflow Analysis
        </h1>
        
        <input 
          type="month" 
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Arus Masuk</p>
          <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpCircle className="w-16 h-16 text-red-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Arus Keluar</p>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Net Cashflow</p>
          <p className={`text-3xl font-bold ${netCashflow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(netCashflow)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Trend Arus Kas Harian</h2>
          <div className="h-80">
            <Line 
              data={lineChartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  legend: { position: 'top' },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
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
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Net Cashflow Harian</h2>
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
                        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(context.parsed.y || 0);
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
      </div>
    </div>
  );
}
