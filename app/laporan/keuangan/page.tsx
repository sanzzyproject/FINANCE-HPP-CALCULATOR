'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { getAllData, Transaction, Product } from '@/lib/db';
import { format, parseISO, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function LaporanKeuanganPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
    setSelectedYear(format(new Date(), 'yyyy'));
    setIsMounted(true);
    const loadData = async () => {
      const [txs, prods] = await Promise.all([
        getAllData('transactions'),
        getAllData('products')
      ]);
      setTransactions(txs);
      setProducts(prods);
    };
    loadData();
  }, []);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-64">Memuat laporan...</div>;
  }

  const getFilteredTransactions = () => {
    let start: Date;
    let end: Date;

    if (reportType === 'daily') {
      const date = parseISO(selectedDate);
      start = startOfDay(date);
      end = endOfDay(date);
    } else if (reportType === 'monthly') {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else {
      const date = new Date(parseInt(selectedYear), 0, 1);
      start = startOfYear(date);
      end = endOfYear(date);
    }

    return transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      return isWithinInterval(txDate, { start, end });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredTxs = getFilteredTransactions();
  
  const totalIncome = filteredTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = filteredTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  const profit = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Get business name from localStorage
    const businessName = localStorage.getItem('businessName') || 'UMKM Finance Pro';

    // Header
    doc.setFontSize(18);
    doc.text(`Laporan Keuangan - ${businessName}`, 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    let periodText = '';
    if (reportType === 'daily') periodText = format(parseISO(selectedDate), 'dd MMMM yyyy', { locale: id });
    if (reportType === 'monthly') periodText = format(new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]) - 1, 1), 'MMMM yyyy', { locale: id });
    if (reportType === 'yearly') periodText = `Tahun ${selectedYear}`;
    
    doc.text(`Periode: ${periodText}`, 14, 30);
    doc.text(`Dicetak pada: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}`, 14, 36);

    // Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 42, 182, 30, 3, 3, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Total Pemasukan', 20, 52);
    doc.text('Total Pengeluaran', 80, 52);
    doc.text('Profit Bersih', 140, 52);
    
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Blue
    doc.text(formatCurrency(totalIncome), 20, 62);
    
    doc.setTextColor(220, 38, 38); // Red
    doc.text(formatCurrency(totalExpense), 80, 62);
    
    if (profit >= 0) {
      doc.setTextColor(16, 185, 129); // Emerald
    } else {
      doc.setTextColor(220, 38, 38); // Red
    }
    doc.text(formatCurrency(profit), 140, 62);

    // Table
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Rincian Transaksi', 14, 85);

    const tableData = filteredTxs.map(tx => [
      format(parseISO(tx.date), 'dd/MM/yyyy'),
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.category,
      tx.description,
      tx.type === 'income' ? formatCurrency(tx.amount) : `-${formatCurrency(tx.amount)}`
    ]);

    (doc as any).autoTable({
      startY: 90,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Jumlah']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 9 },
      columnStyles: {
        4: { halign: 'right' }
      }
    });

    doc.save(`Laporan_Keuangan_${periodText.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-slate-900">Laporan Keuangan</h1>
        </div>
        
        <button
          onClick={handleExportPDF}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Export PDF
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center">
              <Filter className="w-4 h-4 mr-1" />
              Tipe Laporan
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>

          <div className="w-full md:w-1/3">
            {reportType === 'daily' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
            {reportType === 'monthly' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Bulan</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}
            {reportType === 'yearly' && (
              <>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm font-medium text-blue-800">Total Pemasukan</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm font-medium text-red-800">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${profit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm font-medium ${profit >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>Profit Bersih</p>
            <p className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </p>
          </div>
        </div>

        {/* Transactions Table */}
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Rincian Transaksi</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxs.length > 0 ? (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(parseISO(tx.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{tx.category}</td>
                    <td className="px-4 py-3">{tx.description}</td>
                    <td className={`px-4 py-3 text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Tidak ada transaksi pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
