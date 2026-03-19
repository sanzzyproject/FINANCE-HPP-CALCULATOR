'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { addData, getAllData, deleteData, updateData, Debt } from '@/lib/db';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  date: z.string().min(1, 'Tanggal wajib diisi'),
  amount: z.number().min(1, 'Jumlah harus lebih dari 0'),
});

type FormData = z.infer<typeof schema>;

export default function HutangPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  const loadData = async () => {
    const data = await getAllData('debts');
    setDebts(data.filter(d => d.type === 'payable').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: FormData) => {
    if (editingId) {
      const existing = debts.find(d => d.id === editingId);
      await updateData('debts', { 
        id: editingId, 
        type: 'payable', 
        status: existing?.status || 'unpaid',
        ...data
      });
    } else {
      await addData('debts', { 
        type: 'payable', 
        status: 'unpaid',
        ...data
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
    reset();
    loadData();
  };

  const handleEdit = (debt: Debt) => {
    setEditingId(debt.id!);
    setValue('name', debt.name);
    setValue('date', debt.date);
    setValue('amount', debt.amount);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus data ini?')) {
      await deleteData('debts', id);
      loadData();
    }
  };

  const toggleStatus = async (debt: Debt) => {
    await updateData('debts', {
      ...debt,
      status: debt.status === 'paid' ? 'unpaid' : 'paid'
    });
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Hutang (Ke Supplier)</h1>
        <button
          onClick={() => {
            reset();
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Hutang
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-4">Nama Supplier</th>
                <th className="px-6 py-4">Tanggal Jatuh Tempo</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {debts.length > 0 ? (
                debts.map((debt) => (
                  <tr key={debt.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{debt.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(parseISO(debt.date), 'dd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-orange-600">
                      {formatCurrency(debt.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(debt)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          debt.status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }`}
                      >
                        {debt.status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(debt)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(debt.id!)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data hutang.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Hutang' : 'Tambah Hutang'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Supplier</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Contoh: Toko Bahan A"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Jatuh Tempo</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-orange-600 rounded-lg hover:bg-orange-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
