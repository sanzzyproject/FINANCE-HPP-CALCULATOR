'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, ArrowDownCircle, ArrowUpCircle, Layers, AlertTriangle } from 'lucide-react';
import { getAllData, addData, Product, StockMovement, updateData } from '@/lib/db';
import { cn } from '@/components/Layout';

export default function StokPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [type, setType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allProducts = await getAllData('products');
    setProducts(allProducts);
    
    const allMovements = await getAllData('stock_movements');
    setMovements(allMovements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const selectedProduct = products.find(p => p.id === Number(selectedProductId));
    if (!selectedProduct) return;

    if (type === 'out' && (selectedProduct.stock || 0) < quantity) {
      alert('Stok tidak mencukupi untuk dikeluarkan!');
      return;
    }

    setIsSubmitting(true);
    try {
      const date = new Date().toISOString();
      
      // 1. Create Stock Movement
      const movement: StockMovement = {
        date,
        productId: selectedProduct.id!,
        type,
        quantity,
        notes,
      };
      await addData('stock_movements', movement);

      // 2. Update Product Stock
      const newStock = type === 'in' 
        ? (selectedProduct.stock || 0) + quantity 
        : (selectedProduct.stock || 0) - quantity;
        
      const updatedProduct = { ...selectedProduct, stock: newStock };
      await updateData('products', updatedProduct);

      // Reset form
      setSelectedProductId('');
      setQuantity(1);
      setNotes('');
      setType('in');
      setIsModalOpen(false);
      
      // Reload data
      await loadData();
    } catch (error) {
      console.error('Error saving stock movement:', error);
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lowStockProducts = products.filter(p => (p.stock || 0) <= 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Stok</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Catat Stok
        </button>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-amber-800">Peringatan Stok Menipis</h3>
            <div className="mt-1 text-sm text-amber-700">
              <ul className="list-disc pl-5 space-y-1">
                {lowStockProducts.map(p => (
                  <li key={p.id}>{p.name} (Sisa: {p.stock || 0})</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daftar Produk & Stok */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
              <Layers className="w-5 h-5 mr-2 text-slate-500" />
              <h2 className="font-semibold text-slate-800">Stok Saat Ini</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-sm font-bold",
                      (product.stock || 0) <= 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {product.stock || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Belum ada produk. Tambahkan produk terlebih dahulu.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Riwayat Pergerakan Stok */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800">Riwayat Pergerakan Stok</h2>
            </div>
            
            {movements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4 text-center">Qty</th>
                      <th className="px-6 py-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((movement) => {
                      const product = products.find(p => p.id === movement.productId);
                      return (
                        <tr key={movement.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(new Date(movement.date), 'dd MMM yyyy HH:mm', { locale: id })}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {product?.name || 'Produk Dihapus'}
                          </td>
                          <td className="px-6 py-4">
                            {movement.type === 'in' ? (
                              <span className="flex items-center text-emerald-600 font-medium">
                                <ArrowDownCircle className="w-4 h-4 mr-1" /> Masuk
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600 font-medium">
                                <ArrowUpCircle className="w-4 h-4 mr-1" /> Keluar
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-700">
                            {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                          </td>
                          <td className="px-6 py-4 text-slate-600">{movement.notes}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">Belum ada pergerakan stok</h3>
                <p className="text-slate-500">Catat stok masuk atau keluar untuk melihat riwayat.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Tambah Stok */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Catat Pergerakan Stok</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Pergerakan</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('in')}
                    className={cn(
                      "py-2.5 rounded-lg border font-medium flex items-center justify-center transition-colors",
                      type === 'in' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4 mr-2" /> Stok Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('out')}
                    className={cn(
                      "py-2.5 rounded-lg border font-medium flex items-center justify-center transition-colors",
                      type === 'out' ? "bg-red-50 border-red-200 text-red-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2" /> Stok Keluar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Produk</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">-- Pilih Produk --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Sisa: {p.stock || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={type === 'in' ? 'Contoh: Restock dari supplier' : 'Contoh: Barang rusak'}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedProductId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
