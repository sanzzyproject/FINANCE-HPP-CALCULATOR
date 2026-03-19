'use client';

import React, { useState, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from 'lucide-react';
import { getAllData, Transaction, Sale } from '@/lib/db';
import { cn } from '@/components/Layout';

export default function CalendarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    loadData();
  }, []);

  const loadData = async () => {
    const allTxs = await getAllData('transactions');
    setTransactions(allTxs);
    
    const allSales = await getAllData('sales');
    setSales(allSales);
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-64">Memuat kalender...</div>;
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getDayData = (date: Date) => {
    const dayTxs = transactions.filter(tx => isSameDay(parseISO(tx.date), date));
    const daySales = sales.filter(s => isSameDay(parseISO(s.date), date));
    
    const income = dayTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = dayTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const salesTotal = daySales.reduce((sum, s) => sum + s.total, 0);

    return { income, expense, salesTotal, txs: dayTxs, sales: daySales };
  };

  const selectedDayData = selectedDate ? getDayData(selectedDate) : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-blue-600" />
          Kalender Transaksi
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              {format(currentDate, 'MMMM yyyy', { locale: id })}
            </h2>
            <div className="flex space-x-2">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2 h-24 bg-slate-50/50 rounded-lg border border-transparent"></div>
            ))}
            
            {daysInMonth.map((day, i) => {
              const data = getDayData(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "p-2 h-24 rounded-lg border cursor-pointer transition-all flex flex-col",
                    isSelected ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-100 hover:border-blue-300 hover:bg-slate-50",
                    isToday && !isSelected && "border-blue-200 bg-blue-50/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                      isToday ? "bg-blue-600 text-white" : "text-slate-700"
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end space-y-1">
                    {data.income > 0 && (
                      <div className="text-[10px] font-medium text-emerald-600 truncate flex items-center">
                        <ArrowDownCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(data.income)}
                      </div>
                    )}
                    {data.expense > 0 && (
                      <div className="text-[10px] font-medium text-red-600 truncate flex items-center">
                        <ArrowUpCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                        {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(data.expense)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">
                {selectedDate ? format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id }) : 'Pilih Tanggal'}
              </h2>
            </div>
            
            <div className="p-6">
              {selectedDayData ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-600 font-medium mb-1 flex items-center">
                        <ArrowDownCircle className="w-3 h-3 mr-1" /> Pemasukan
                      </p>
                      <p className="font-bold text-emerald-700">{formatCurrency(selectedDayData.income)}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 font-medium mb-1 flex items-center">
                        <ArrowUpCircle className="w-3 h-3 mr-1" /> Pengeluaran
                      </p>
                      <p className="font-bold text-red-700">{formatCurrency(selectedDayData.expense)}</p>
                    </div>
                  </div>

                  {/* Transactions List */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2">Daftar Transaksi</h3>
                    {selectedDayData.txs.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {selectedDayData.txs.map(tx => (
                          <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                                tx.type === 'income' ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                              )}>
                                {tx.type === 'income' ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpCircle className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900">{tx.category}</p>
                                <p className="text-xs text-slate-500 truncate max-w-[120px]">{tx.description}</p>
                              </div>
                            </div>
                            <span className={cn(
                              "text-sm font-bold",
                              tx.type === 'income' ? "text-emerald-600" : "text-red-600"
                            )}>
                              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">Tidak ada transaksi pada tanggal ini.</p>
                    )}
                  </div>

                  {/* Sales List */}
                  {selectedDayData.sales.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3 border-b pb-2 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
                        Penjualan Produk
                      </h3>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {selectedDayData.sales.map(sale => (
                          <div key={sale.id} className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div>
                              <p className="text-sm font-medium text-slate-900">Penjualan #{sale.id}</p>
                              <p className="text-xs text-slate-500">{sale.quantity} item</p>
                            </div>
                            <span className="text-sm font-bold text-blue-600">
                              {formatCurrency(sale.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Pilih tanggal pada kalender untuk melihat detail transaksi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
