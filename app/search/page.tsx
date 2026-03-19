'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, ArrowDownCircle, ArrowUpCircle, CreditCard, ShoppingCart } from 'lucide-react';
import { getAllData, Product, Transaction, Debt, Sale } from '@/lib/db';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      performSearch();
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);

    const lowerQuery = query.toLowerCase();

    // Fetch all data
    const allProducts = await getAllData('products');
    const allTxs = await getAllData('transactions');
    const allDebts = await getAllData('debts');
    const allSales = await getAllData('sales');

    // Filter by query
    setProducts(allProducts.filter(p => 
      (p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery))
    ));

    setTransactions(allTxs.filter(tx => 
      (tx.description.toLowerCase().includes(lowerQuery) || tx.category.toLowerCase().includes(lowerQuery))
    ));

    setDebts(allDebts.filter(d => 
      d.name.toLowerCase().includes(lowerQuery)
    ));

    // For sales, we might want to search by product name, but we need the product details
    const matchingProductIds = allProducts
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .map(p => p.id);

    setSales(allSales.filter(s => 
      matchingProductIds.includes(s.productId)
    ));

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const totalResults = products.length + transactions.length + debts.length + sales.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Search className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hasil Pencarian</h1>
          <p className="text-slate-500">
            {isLoading ? 'Mencari...' : `Menemukan ${totalResults} hasil untuk "${query}"`}
          </p>
        </div>
      </div>

      {!isLoading && totalResults === 0 && (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-100">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Tidak ada hasil ditemukan</h3>
          <p className="text-slate-500">Coba gunakan kata kunci lain untuk mencari.</p>
        </div>
      )}

      {!isLoading && totalResults > 0 && (
        <div className="space-y-8">
          {/* Products Results */}
          {products.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-500" />
                Produk ({products.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:border-blue-300 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(product.price)}</p>
                      <p className="text-xs text-slate-500">Stok: {product.stock || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transactions Results */}
          {transactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <ArrowDownCircle className="w-5 h-5 mr-2 text-emerald-500" />
                Transaksi ({transactions.length})
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {transactions.map(tx => (
                    <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {tx.type === 'income' ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{tx.description}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(tx.date), 'dd MMM yyyy', { locale: id })} • {tx.category}
                          </p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sales Results */}
          {sales.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-500" />
                Penjualan ({sales.length})
              </h2>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {sales.map(sale => (
                    <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-4">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Penjualan #{sale.id}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(sale.date), 'dd MMM yyyy', { locale: id })} • Qty: {sale.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Debts Results */}
          {debts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-amber-500" />
                Hutang / Piutang ({debts.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debts.map(debt => (
                  <div key={debt.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{debt.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${debt.type === 'payable' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {debt.type === 'payable' ? 'Hutang' : 'Piutang'}
                      </span>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-xs text-slate-500">Tanggal</p>
                        <p className="text-sm font-medium text-slate-700">{format(new Date(debt.date), 'dd MMM yyyy', { locale: id })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Jumlah</p>
                        <p className="font-bold text-slate-900">{formatCurrency(debt.amount)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-500">Memuat pencarian...</div>}>
      <SearchContent />
    </Suspense>
  );
}
