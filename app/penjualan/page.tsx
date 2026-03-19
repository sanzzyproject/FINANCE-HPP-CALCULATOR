'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Trash2, ShoppingCart, Save } from 'lucide-react';
import { getAllData, addData, Product, Sale, StockMovement, updateData } from '@/lib/db';
import { cn } from '@/components/Layout';

export default function PenjualanPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allProducts = await getAllData('products');
    setProducts(allProducts);
    
    const allSales = await getAllData('sales');
    setSales(allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const selectedProduct = products.find(p => p.id === Number(selectedProductId));
  const subtotal = selectedProduct ? selectedProduct.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedProduct.id) return;
    
    if ((selectedProduct.stock || 0) < quantity) {
      alert('Stok produk tidak mencukupi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const date = new Date().toISOString();
      
      // 1. Create Sale record
      const sale: Sale = {
        date,
        productId: selectedProduct.id,
        quantity,
        price: selectedProduct.price,
        total: subtotal,
      };
      await addData('sales', sale);

      // 2. Create Stock Movement (Out)
      const movement: StockMovement = {
        date,
        productId: selectedProduct.id,
        type: 'out',
        quantity,
        notes: `Penjualan`,
      };
      await addData('stock_movements', movement);

      // 3. Update Product Stock
      const updatedProduct = { ...selectedProduct, stock: (selectedProduct.stock || 0) - quantity };
      await updateData('products', updatedProduct);

      // 4. Record as Income Transaction
      await addData('transactions', {
        type: 'income',
        date,
        category: 'Penjualan',
        description: `Penjualan: ${selectedProduct.name} (${quantity}x)`,
        amount: subtotal,
      });

      // Reset form
      setSelectedProductId('');
      setQuantity(1);
      
      // Reload data
      await loadData();
      alert('Transaksi penjualan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving sale:', error);
      alert('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Kasir Penjualan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Transaksi */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
              Transaksi Baru
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Produk</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={(p.stock || 0) <= 0}>
                      {p.name} - {formatCurrency(p.price)} (Stok: {p.stock || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <div className="flex items-center">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-l-lg hover:bg-slate-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedProduct?.stock || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2 border-y border-slate-300 text-center focus:ring-0 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedProduct?.stock || 999, quantity + 1))}
                    className="px-4 py-2 bg-slate-100 border border-slate-300 rounded-r-lg hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
                {selectedProduct && (
                  <p className="text-xs text-slate-500 mt-1">Maksimal: {selectedProduct.stock || 0}</p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500">Harga Satuan</span>
                  <span className="font-medium">{formatCurrency(selectedProduct?.price || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-blue-600">
                  <span>Total Bayar</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedProductId || quantity < 1}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium mt-6"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>

        {/* Riwayat Penjualan */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Riwayat Penjualan Terakhir</h2>
            </div>
            
            {sales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4 text-right">Harga</th>
                      <th className="px-6 py-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.slice(0, 10).map((sale) => {
                      const product = products.find(p => p.id === sale.productId);
                      return (
                        <tr key={sale.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(new Date(sale.date), 'dd MMM yyyy HH:mm', { locale: id })}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {product?.name || 'Produk Dihapus'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                              {sale.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">{formatCurrency(sale.price)}</td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatCurrency(sale.total)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Belum ada penjualan</h3>
                <p className="text-slate-500">Transaksi penjualan Anda akan muncul di sini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
