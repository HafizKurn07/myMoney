import { db } from './db';
import type {
  Account,
  IncomeSource,
  Category,
  MonthlyIncome,
  Allocation,
  Transaction,
  Asset,
  Settings,
} from '../types';

export const SEED_ACCOUNTS: Account[] = [
  { id: 'acc-bca', name: 'BCA', isActive: true, sortOrder: 1 },
  { id: 'acc-jago', name: 'Jago', isActive: true, sortOrder: 2 },
  { id: 'acc-bibit', name: 'Bibit', isActive: true, sortOrder: 3 },
];

export const SEED_INCOME_SOURCES: IncomeSource[] = [
  { id: 'inc-gaji', name: 'Gaji Bulanan', isActive: true, sortOrder: 1 },
  { id: 'inc-freelance', name: 'Freelance Fee', isActive: true, sortOrder: 2 },
];

export const SEED_CATEGORIES: Category[] = [
  // Needs (BCA)
  { id: 'cat-family', name: 'Family', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 1 },
  { id: 'cat-utilities', name: 'Utilities', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 2 },
  { id: 'cat-food', name: 'Food', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 3 },
  { id: 'cat-supplies', name: 'Supplies', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 4 },
  { id: 'cat-transport', name: 'Transportation', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 5 },
  { id: 'cat-health', name: 'Healthcare', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 6 },
  { id: 'cat-debt', name: 'Debt', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 7 },

  // Wants (Jago)
  { id: 'cat-shopping', name: 'Shopping', type: 'wants', accountId: 'acc-jago', isActive: true, sortOrder: 8 },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'wants', accountId: 'acc-jago', isActive: true, sortOrder: 9 },
  { id: 'cat-gifts', name: 'Gifts', type: 'wants', accountId: 'acc-jago', isActive: true, sortOrder: 10 },
  { id: 'cat-travel', name: 'Travel', type: 'wants', accountId: 'acc-jago', isActive: true, sortOrder: 11 },

  // Savings (Bibit)
  { id: 'cat-gen-savings', name: 'General Savings', type: 'savings', accountId: 'acc-bibit', isActive: true, sortOrder: 12 },
  { id: 'cat-emergency', name: 'Emergency Funds', type: 'savings', accountId: 'acc-bibit', isActive: true, sortOrder: 13 },
];

export const SEED_MONTHLY_INCOMES: MonthlyIncome[] = [
  { id: 'minc-2024-01-gaji', year: 2024, month: 1, incomeSourceId: 'inc-gaji', amount: 6593000 },
  { id: 'minc-2024-01-freelance', year: 2024, month: 1, incomeSourceId: 'inc-freelance', amount: 350000 },
];

export const SEED_ALLOCATIONS: Allocation[] = [
  // Needs
  { id: 'alloc-2024-01-family', year: 2024, month: 1, categoryId: 'cat-family', amount: 500000 },
  { id: 'alloc-2024-01-utilities', year: 2024, month: 1, categoryId: 'cat-utilities', amount: 500000 },
  { id: 'alloc-2024-01-food', year: 2024, month: 1, categoryId: 'cat-food', amount: 600000 },
  { id: 'alloc-2024-01-supplies', year: 2024, month: 1, categoryId: 'cat-supplies', amount: 500000 },
  { id: 'alloc-2024-01-transport', year: 2024, month: 1, categoryId: 'cat-transport', amount: 400000 },
  { id: 'alloc-2024-01-health', year: 2024, month: 1, categoryId: 'cat-health', amount: 200000 },
  { id: 'alloc-2024-01-debt', year: 2024, month: 1, categoryId: 'cat-debt', amount: 0 },

  // Wants
  { id: 'alloc-2024-01-shopping', year: 2024, month: 1, categoryId: 'cat-shopping', amount: 200000 },
  { id: 'alloc-2024-01-entertainment', year: 2024, month: 1, categoryId: 'cat-entertainment', amount: 200000 },
  { id: 'alloc-2024-01-gifts', year: 2024, month: 1, categoryId: 'cat-gifts', amount: 150000 },
  { id: 'alloc-2024-01-travel', year: 2024, month: 1, categoryId: 'cat-travel', amount: 0 },

  // Savings
  { id: 'alloc-2024-01-gen-savings', year: 2024, month: 1, categoryId: 'cat-gen-savings', amount: 1000000 },
  { id: 'alloc-2024-01-emergency', year: 2024, month: 1, categoryId: 'cat-emergency', amount: 500000 },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    date: '2024-01-12',
    description: 'Beli token listrik',
    categoryId: 'cat-utilities',
    amount: 500000,
    isChecked: false,
    createdAt: '2024-01-12T10:00:00.000Z',
  },
  {
    id: 'trx-2',
    date: '2024-01-12',
    description: 'Topup emoney',
    categoryId: 'cat-transport',
    amount: 102500,
    isChecked: false,
    createdAt: '2024-01-12T11:30:00.000Z',
  },
  {
    id: 'trx-3',
    date: '2024-01-09',
    description: 'Beli bahan kue',
    categoryId: 'cat-food',
    amount: 88000,
    isChecked: false,
    createdAt: '2024-01-09T09:15:00.000Z',
  },
  {
    id: 'trx-4',
    date: '2024-01-09',
    description: 'Beli tempe pasar',
    categoryId: 'cat-food',
    amount: 10000,
    isChecked: false,
    createdAt: '2024-01-09T14:00:00.000Z',
  },
  {
    id: 'trx-5',
    date: '2024-01-08',
    description: 'Beli obat di Halodoc',
    categoryId: 'cat-health',
    amount: 100000,
    isChecked: false,
    createdAt: '2024-01-08T16:20:00.000Z',
  },
  {
    id: 'trx-6',
    date: '2024-01-06',
    description: 'Belanja kebutuhan rumah bulanan',
    categoryId: 'cat-supplies',
    amount: 300000,
    isChecked: false,
    createdAt: '2024-01-06T11:00:00.000Z',
  },
  {
    id: 'trx-7',
    date: '2024-01-05',
    description: 'Ke Dufan',
    categoryId: 'cat-entertainment',
    amount: 178000,
    isChecked: false,
    createdAt: '2024-01-05T13:45:00.000Z',
  },
  {
    id: 'trx-8',
    date: '2024-01-04',
    description: 'Transportasi umum',
    categoryId: 'cat-transport',
    amount: 280000,
    isChecked: false,
    createdAt: '2024-01-04T08:10:00.000Z',
  },
  {
    id: 'trx-9',
    date: '2024-01-03',
    description: 'Nongkrong',
    categoryId: 'cat-food',
    amount: 75000,
    isChecked: false,
    createdAt: '2024-01-03T19:30:00.000Z',
  },
  {
    id: 'trx-10',
    date: '2024-01-02',
    description: 'Tambahan belanja bulanan',
    categoryId: 'cat-supplies',
    amount: 100000,
    isChecked: false,
    createdAt: '2024-01-02T15:00:00.000Z',
  },
  {
    id: 'trx-11',
    date: '2024-01-02',
    description: 'Alokasi makan seminggu',
    categoryId: 'cat-food',
    amount: 300000,
    isChecked: false,
    createdAt: '2024-01-02T12:00:00.000Z',
  },
];

export const SEED_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'Tabungan',
    value: 328982000,
    liquidity: 'liquid',
    assetType: 'Tabungan',
    accountId: 'acc-bca',
    updatedAt: '2024-01-01',
  },
  {
    id: 'asset-2',
    name: 'Saham',
    value: 4000000,
    liquidity: 'non_liquid',
    assetType: 'Saham',
    accountId: 'acc-bibit',
    updatedAt: '2024-01-01',
  },
  {
    id: 'asset-3',
    name: 'Reksa Dana',
    value: 1000000,
    liquidity: 'non_liquid',
    assetType: 'Reksa Dana',
    accountId: 'acc-bibit',
    updatedAt: '2024-01-01',
  },
  {
    id: 'asset-4',
    name: 'Saldo BPJS',
    value: 500000,
    liquidity: 'non_liquid',
    assetType: 'BPJS',
    accountId: undefined,
    updatedAt: '2024-01-01',
  },
];

export const SEED_SETTINGS: Settings = {
  id: 1,
  activeYear: 2024,
  paydayDay: 25,
  assetTarget: 1500000000,
};

export async function initSeedDataIfEmpty(): Promise<boolean> {
  const accountsCount = await db.accounts.count();
  if (accountsCount > 0) {
    return false; // Database already initialized
  }

  await db.transaction('rw', [
    db.accounts,
    db.income_sources,
    db.categories,
    db.monthly_incomes,
    db.allocations,
    db.transactions,
    db.assets,
    db.settings,
  ], async () => {
    await db.accounts.bulkPut(SEED_ACCOUNTS);
    await db.income_sources.bulkPut(SEED_INCOME_SOURCES);
    await db.categories.bulkPut(SEED_CATEGORIES);
    await db.monthly_incomes.bulkPut(SEED_MONTHLY_INCOMES);
    await db.allocations.bulkPut(SEED_ALLOCATIONS);
    await db.transactions.bulkPut(SEED_TRANSACTIONS);
    await db.assets.bulkPut(SEED_ASSETS);
    await db.settings.put(SEED_SETTINGS);
  });

  return true;
}

export async function resetDatabaseToSeed(): Promise<void> {
  await db.transaction('rw', [
    db.accounts,
    db.income_sources,
    db.categories,
    db.monthly_incomes,
    db.allocations,
    db.transactions,
    db.assets,
    db.settings,
  ], async () => {
    await db.accounts.clear();
    await db.income_sources.clear();
    await db.categories.clear();
    await db.monthly_incomes.clear();
    await db.allocations.clear();
    await db.transactions.clear();
    await db.assets.clear();
    await db.settings.clear();

    await db.accounts.bulkPut(SEED_ACCOUNTS);
    await db.income_sources.bulkPut(SEED_INCOME_SOURCES);
    await db.categories.bulkPut(SEED_CATEGORIES);
    await db.monthly_incomes.bulkPut(SEED_MONTHLY_INCOMES);
    await db.allocations.bulkPut(SEED_ALLOCATIONS);
    await db.transactions.bulkPut(SEED_TRANSACTIONS);
    await db.assets.bulkPut(SEED_ASSETS);
    await db.settings.put(SEED_SETTINGS);
  });
}
