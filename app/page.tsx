'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  BarChart2, 
  Calculator, 
  Layers, 
  ShieldCheck, 
  Smartphone, 
  TrendingUp, 
  CheckCircle2,
  Wallet,
  ShoppingCart,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">UMKM Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block"
              >
                Masuk
              </Link>
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Mulai Gratis <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
              Kelola Keuangan UMKM Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Lebih Cerdas</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed">
              Platform all-in-one untuk mencatat transaksi, mengelola stok, menghitung HPP, dan menganalisis profit bisnis Anda. 100% gratis dan aman di perangkat Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5"
              >
                Buka Dashboard Sekarang
              </Link>
              <a 
                href="#fitur" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Pelajari Fitur
              </a>
            </div>
          </div>

          {/* Hero Image / Dashboard Mockup */}
          <div className="mt-16 lg:mt-24 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
            <div className="rounded-2xl border border-slate-200/60 bg-white shadow-2xl overflow-hidden transform transition-transform hover:scale-[1.01] duration-500">
              <div className="h-8 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-2 bg-slate-50">
                <div className="aspect-[16/9] bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative">
                  {/* Abstract Mockup Representation */}
                  <div className="absolute inset-0 p-6 flex flex-col gap-4">
                    <div className="flex gap-4 h-24">
                      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full mb-2"></div>
                        <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="w-32 h-6 bg-slate-300 rounded"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full mb-2"></div>
                        <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="w-32 h-6 bg-slate-300 rounded"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full mb-2"></div>
                        <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
                        <div className="w-32 h-6 bg-slate-300 rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
                        <div className="w-48 h-5 bg-slate-200 rounded mb-4"></div>
                        <div className="flex-1 border-b-2 border-l-2 border-slate-100 relative">
                          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-100 to-transparent opacity-50"></div>
                          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path d="M0,100 L20,80 L40,90 L60,40 L80,60 L100,20" fill="none" stroke="#3b82f6" strokeWidth="2" />
                          </svg>
                        </div>
                      </div>
                      <div className="w-1/3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
                        <div className="w-32 h-5 bg-slate-200 rounded mb-2"></div>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                            <div className="flex-1">
                              <div className="w-full h-3 bg-slate-200 rounded mb-1"></div>
                              <div className="w-2/3 h-2 bg-slate-100 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Lengkap untuk Bisnis Anda</h2>
            <p className="text-lg text-slate-600">Semua alat yang Anda butuhkan untuk mengelola dan mengembangkan UMKM dalam satu aplikasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Wallet}
              title="Manajemen Keuangan"
              description="Catat pemasukan, pengeluaran, hutang, dan piutang dengan mudah. Pantau arus kas harian Anda."
              color="bg-blue-100 text-blue-600"
            />
            <FeatureCard 
              icon={ShoppingCart}
              title="Kasir Penjualan"
              description="Sistem kasir sederhana yang terintegrasi langsung dengan stok produk dan laporan keuangan."
              color="bg-emerald-100 text-emerald-600"
            />
            <FeatureCard 
              icon={Layers}
              title="Manajemen Stok"
              description="Pantau pergerakan barang masuk dan keluar. Dapatkan peringatan otomatis saat stok menipis."
              color="bg-amber-100 text-amber-600"
            />
            <FeatureCard 
              icon={Calculator}
              title="Kalkulator HPP"
              description="Hitung Harga Pokok Penjualan secara akurat berdasarkan bahan baku dan biaya operasional."
              color="bg-purple-100 text-purple-600"
            />
            <FeatureCard 
              icon={Activity}
              title="Analisis Profit"
              description="Ketahui produk mana yang paling menguntungkan dan pantau margin bisnis Anda secara real-time."
              color="bg-indigo-100 text-indigo-600"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Aman & Offline-First"
              description="Data disimpan aman di perangkat Anda. Aplikasi tetap bisa digunakan meski tanpa koneksi internet."
              color="bg-slate-100 text-slate-600"
            />
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Mengapa Memilih UMKM Pro?</h2>
              <div className="space-y-6">
                <AdvantageItem 
                  title="Multi-Bisnis Support"
                  description="Kelola lebih dari satu toko atau usaha dalam satu aplikasi tanpa perlu membuat akun baru."
                />
                <AdvantageItem 
                  title="Laporan Otomatis"
                  description="Hasilkan laporan keuangan profesional dalam format PDF hanya dengan satu klik."
                />
                <AdvantageItem 
                  title="Privasi Terjamin"
                  description="Tidak ada data yang dikirim ke server kami. Semua data milik Anda dan tersimpan di perangkat Anda."
                />
                <AdvantageItem 
                  title="Gratis Selamanya"
                  description="Tidak ada biaya langganan, tidak ada iklan yang mengganggu. Dibuat khusus untuk memajukan UMKM Indonesia."
                />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900">Target Keuangan</h3>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">Bulan Ini</span>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-500">Pencapaian Profit</span>
                      <span className="font-bold text-slate-900">Rp 8.500.000</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 text-right">Target: Rp 10.000.000</p>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Produk Terlaris</h4>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{i}</div>
                            <span className="text-sm font-medium text-slate-700">Produk Unggulan {i}</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">+Rp {(4-i) * 1.5}M</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Siap Mengembangkan Bisnis Anda?</h2>
          <p className="text-blue-100 text-lg mb-10">
            Bergabunglah dengan ribuan UMKM lainnya yang telah menggunakan UMKM Pro untuk mengelola keuangan mereka.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-slate-50 transition-colors shadow-lg"
          >
            Mulai Gunakan Sekarang - Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">UMKM Pro</span>
          </div>
          <p className="text-slate-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} UMKM Pro. Developed by SANN404 FORUM.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function AdvantageItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}
