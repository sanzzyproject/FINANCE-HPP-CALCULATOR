'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calculator } from 'lucide-react';
import { getAllData, updateData, Product, Material } from '@/lib/db';

interface HppMaterial {
  materialId?: number;
  name: string;
  pricePerUnit: number;
  unit: string;
  quantity: number;
}

export default function KalkulatorHppPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [hppMaterials, setHppMaterials] = useState<HppMaterial[]>([]);
  const [productionCost, setProductionCost] = useState<number>(0);
  const [packagingCost, setPackagingCost] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<number>(1);

  useEffect(() => {
    const loadData = async () => {
      const [prods, mats] = await Promise.all([
        getAllData('products'),
        getAllData('materials')
      ]);
      setProducts(prods);
      setMaterials(mats);
    };
    loadData();
  }, []);

  const handleAddMaterial = () => {
    setHppMaterials([...hppMaterials, { name: '', pricePerUnit: 0, unit: '', quantity: 1 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = [...hppMaterials];
    newMaterials.splice(index, 1);
    setHppMaterials(newMaterials);
  };

  const handleMaterialChange = (index: number, field: keyof HppMaterial, value: any) => {
    const newMaterials = [...hppMaterials];
    
    if (field === 'materialId') {
      const selectedMat = materials.find(m => m.id === Number(value));
      if (selectedMat) {
        newMaterials[index] = {
          ...newMaterials[index],
          materialId: selectedMat.id,
          name: selectedMat.name,
          pricePerUnit: selectedMat.pricePerUnit,
          unit: selectedMat.unit,
        };
      }
    } else {
      newMaterials[index] = { ...newMaterials[index], [field]: value };
    }
    
    setHppMaterials(newMaterials);
  };

  const totalMaterialCost = hppMaterials.reduce((sum, mat) => sum + (mat.pricePerUnit * mat.quantity), 0);
  const totalProductionCost = totalMaterialCost + productionCost + packagingCost + otherCost;
  const hppPerUnit = productQuantity > 0 ? totalProductionCost / productQuantity : 0;

  const handleSaveHpp = async () => {
    if (!selectedProductId) {
      alert('Pilih produk terlebih dahulu');
      return;
    }
    
    const product = products.find(p => p.id === Number(selectedProductId));
    if (product) {
      await updateData('products', {
        ...product,
        hpp: hppPerUnit
      });
      alert('HPP berhasil disimpan ke produk!');
      // Reload products to get updated HPP
      const prods = await getAllData('products');
      setProducts(prods);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Calculator className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-slate-900">Kalkulator HPP</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Product Selection */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">1. Pilih Produk</h2>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value) || '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Produk --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (Harga Jual: {formatCurrency(p.price)})</option>
              ))}
            </select>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Produk yang Dihasilkan</label>
              <input
                type="number"
                min="1"
                value={productQuantity}
                onChange={(e) => setProductQuantity(Number(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">2. Bahan Baku</h2>
              <button
                onClick={handleAddMaterial}
                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Bahan
              </button>
            </div>
            
            <div className="space-y-4">
              {hppMaterials.map((mat, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-4 items-end p-4 border border-slate-100 rounded-lg bg-slate-50">
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Pilih Bahan (Opsional)</label>
                    <select
                      value={mat.materialId || ''}
                      onChange={(e) => handleMaterialChange(index, 'materialId', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">-- Custom --</option>
                      {materials.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nama Bahan</label>
                    <input
                      type="text"
                      value={mat.name}
                      onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Nama bahan"
                      readOnly={!!mat.materialId}
                    />
                  </div>

                  <div className="w-full md:w-1/5">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Harga/Unit</label>
                    <input
                      type="number"
                      value={mat.pricePerUnit}
                      onChange={(e) => handleMaterialChange(index, 'pricePerUnit', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      readOnly={!!mat.materialId}
                    />
                  </div>

                  <div className="w-full md:w-1/5">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah</label>
                    <input
                      type="number"
                      value={mat.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div className="w-full md:w-auto pt-2 md:pt-0">
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="w-full md:w-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
              
              {hppMaterials.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada bahan baku ditambahkan.</p>
              )}
            </div>
          </div>

          {/* Other Costs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">3. Biaya Lainnya</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Tenaga Kerja</label>
                <input
                  type="number"
                  value={productionCost}
                  onChange={(e) => setProductionCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Kemasan</label>
                <input
                  type="number"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Biaya Operasional Lain</label>
                <input
                  type="number"
                  value={otherCost}
                  onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 sticky top-24">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan HPP</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bahan Baku</span>
                <span className="font-medium">{formatCurrency(totalMaterialCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Tenaga Kerja</span>
                <span className="font-medium">{formatCurrency(productionCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Kemasan</span>
                <span className="font-medium">{formatCurrency(packagingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Biaya Lainnya</span>
                <span className="font-medium">{formatCurrency(otherCost)}</span>
              </div>
              
              <div className="pt-3 border-t border-slate-100 flex justify-between font-semibold">
                <span className="text-slate-700">Total Biaya Produksi</span>
                <span className="text-slate-900">{formatCurrency(totalProductionCost)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Produk</span>
                <span className="font-medium">{productQuantity} unit</span>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-200">
                <span className="block text-sm text-slate-500 mb-1">Harga Pokok Penjualan (HPP) per Unit</span>
                <span className="block text-3xl font-bold text-blue-600">{formatCurrency(hppPerUnit)}</span>
              </div>

              {selectedProductId && (
                <div className="pt-4">
                  <button
                    onClick={handleSaveHpp}
                    className="w-full flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Simpan HPP ke Produk
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
