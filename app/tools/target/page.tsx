'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { Crosshair, Target as TargetIcon, TrendingUp, AlertCircle, Save } from 'lucide-react';
import { getAllData, addData, updateData, Target, Transaction } from '@/lib/db';
import { cn } from '@/components/Layout';

export default function TargetKeuanganPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Form State
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [targetProfit, setTargetProfit] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setSelectedMonth(new Date());
    loadData();
  }, []);

  const loadData = async () => {
    const allTargets = await getAllData('targets');
    setTargets(allTargets);
    
    const allTxs = await getAllData('transactions');
    setTransactions(allTxs);
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-64">Memuat target...</div>;
  }

  const currentMonthTarget = targets.find(t => t.month === selectedMonth.getMonth() && t.year === selectedMonth.getFullYear());
  
  useEffect(() => {
    if (currentMonthTarget) {
      setTargetProfit(currentMonthTarget.targetProfit);
    } else {
      setTargetProfit(0);
    }
  }, [currentMonthTarget, selectedMonth]);

  const currentMonthTxs = transactions.filter(tx => isSameMonth(parseISO(tx.date), selectedMonth));
  const totalIncome = currentMonthTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = currentMonthTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const currentProfit = totalIncome - totalExpense;

  const progress = currentMonthTarget?.targetProfit 
    ? Math.min(100, Math.max(0, (currentProfit / currentMonthTarget.targetProfit) * 100)) 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const month = selectedMonth.getMonth();
      const year = selectedMonth.getFullYear();
      
      if (currentMonthTarget && currentMonthTarget.id) {
        await updateData('targets', {
          ...currentMonthTarget,
          targetProfit,
        });
      } else {
        await addData('targets', {
          month,
          year,
          targetProfit,
        });
      }
      
      await loadData();
      alert('Target berhasil disimpan!');
    } catch (error) {
      console.error('Error saving target:', error);
      alert('Terjadi kesalahan saat menyimpan target.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <Crosshair className="w-6 h-6 mr-2 text-blue-600" />
          Target Keuangan
        </h1>
        
        <input 
          type="month" 
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Target */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TargetIcon className="w-5 h-5 mr-2 text-blue-600" />
            Set Target Profit
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Tentukan target keuntungan bersih (profit) Anda untuk bulan {format(selectedMonth, 'MMMM yyyy', { locale: id })}.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Profit (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-medium"
                placeholder="Contoh: 10000000"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium mt-4"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
            </button>
          </form>
        </div>

        {/* Progress Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
            Pencapaian Bulan Ini
          </h2>
          
          {currentMonthTarget ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm text-slate-500">Profit Saat Ini</p>
                  <p className={cn("text-2xl font-bold", currentProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                    {formatCurrency(currentProfit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Target</p>
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(currentMonthTarget.targetProfit)}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-4 mt-4 overflow-hidden">
                <div 
                  className={cn(
                    "h-4 rounded-full transition-all duration-1000 ease-out",
                    progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-blue-500" : "bg-amber-500"
                  )}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center mt-2 text-sm font-medium text-slate-600">
                {progress.toFixed(1)}% Tercapai
              </p>

              {progress >= 100 && (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800 text-sm text-center font-medium">
                  🎉 Selamat! Anda telah mencapai target bulan ini.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500">Belum ada target yang diatur untuk bulan ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
