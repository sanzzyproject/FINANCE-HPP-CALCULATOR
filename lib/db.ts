import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Debt {
  id?: number;
  type: 'payable' | 'receivable'; // payable = hutang, receivable = piutang
  name: string;
  date: string;
  amount: number;
  status: 'unpaid' | 'paid';
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  description: string;
  category: string;
  hpp?: number; // Calculated HPP
  stock?: number;
}

export interface Material {
  id?: number;
  name: string;
  pricePerUnit: number;
  unit: string;
}

export interface Sale {
  id?: number;
  date: string;
  productId: number;
  quantity: number;
  price: number;
  total: number;
}

export interface StockMovement {
  id?: number;
  date: string;
  productId: number;
  type: 'in' | 'out';
  quantity: number;
  notes: string;
}

export interface Target {
  id?: number;
  month: number;
  year: number;
  targetProfit: number;
}

interface AppDB extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: { 'by-date': string; 'by-type': string };
  };
  debts: {
    key: number;
    value: Debt;
    indexes: { 'by-status': string; 'by-type': string };
  };
  products: {
    key: number;
    value: Product;
  };
  materials: {
    key: number;
    value: Material;
  };
  sales: {
    key: number;
    value: Sale;
    indexes: { 'by-date': string };
  };
  stock_movements: {
    key: number;
    value: StockMovement;
    indexes: { 'by-date': string };
  };
  targets: {
    key: number;
    value: Target;
    indexes: { 'by-month': string };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export const initDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('umkm-finance-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
          txStore.createIndex('by-date', 'date');
          txStore.createIndex('by-type', 'type');
        }
        if (!db.objectStoreNames.contains('debts')) {
          const debtStore = db.createObjectStore('debts', { keyPath: 'id', autoIncrement: true });
          debtStore.createIndex('by-status', 'status');
          debtStore.createIndex('by-type', 'type');
        }
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('materials')) {
          db.createObjectStore('materials', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('sales')) {
          const salesStore = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
          salesStore.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('stock_movements')) {
          const stockStore = db.createObjectStore('stock_movements', { keyPath: 'id', autoIncrement: true });
          stockStore.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('targets')) {
          const targetStore = db.createObjectStore('targets', { keyPath: 'id', autoIncrement: true });
          targetStore.createIndex('by-month', 'month');
        }
      },
    });
  }
  return dbPromise;
};

export const addData = async <T extends 'transactions' | 'debts' | 'products' | 'materials' | 'sales' | 'stock_movements' | 'targets'>(storeName: T, data: AppDB[T]['value']) => {
  const db = await initDB();
  if (!db) return;
  return db.add(storeName, data as any);
};

export const getAllData = async <T extends 'transactions' | 'debts' | 'products' | 'materials' | 'sales' | 'stock_movements' | 'targets'>(storeName: T): Promise<AppDB[T]['value'][]> => {
  const db = await initDB();
  if (!db) return [];
  return db.getAll(storeName) as Promise<AppDB[T]['value'][]>;
};

export const updateData = async <T extends 'transactions' | 'debts' | 'products' | 'materials' | 'sales' | 'stock_movements' | 'targets'>(storeName: T, data: AppDB[T]['value']) => {
  const db = await initDB();
  if (!db) return;
  return db.put(storeName, data as any);
};

export const deleteData = async <T extends 'transactions' | 'debts' | 'products' | 'materials' | 'sales' | 'stock_movements' | 'targets'>(storeName: T, id: number) => {
  const db = await initDB();
  if (!db) return;
  return db.delete(storeName, id);
};

export const clearAllData = async <T extends 'transactions' | 'debts' | 'products' | 'materials' | 'sales' | 'stock_movements' | 'targets'>(storeName: T) => {
  const db = await initDB();
  if (!db) return;
  return db.clear(storeName);
};
