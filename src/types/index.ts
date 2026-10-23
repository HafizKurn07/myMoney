export type CategoryType = 'needs' | 'wants' | 'savings';
export type LiquidityType = 'liquid' | 'non_liquid';
export type AssetType = 'Tabungan' | 'Saham' | 'Obligasi' | 'Reksa Dana' | 'Deposito' | 'BPJS' | 'Lainnya';

export interface Account {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface IncomeSource {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  accountId?: string; // Rekening tujuan default
  isActive: boolean;
  sortOrder: number;
}

export interface MonthlyIncome {
  id: string;
  year: number;
  month: number; // 1 - 12
  incomeSourceId: string;
  amount: number; // in rupiah, bigint stored as number in JS
}

export interface Allocation {
  id: string;
  year: number;
  month: number; // 1 - 12
  categoryId: string;
  amount: number; // in rupiah
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description?: string;
  categoryId: string;
  amount: number; // > 0
  isChecked: boolean;
  createdAt: string; // ISO timestamp
}

export interface Asset {
  id: string;
  name: string;
  value: number; // in rupiah
  liquidity: LiquidityType;
  assetType: AssetType | string;
  accountId?: string;
  updatedAt: string; // YYYY-MM-DD
}

export interface Settings {
  id: number; // 1
  activeYear: number;
  paydayDay: number; // 1 - 31
  assetTarget: number;
}

// UI & Computation Models
export interface CategoryProgress {
  category: Category;
  allocation: number;
  realization: number;
  usagePercent: number;
  remaining: number;
  statusColor: 'green' | 'yellow' | 'red';
}

export interface AccountTransferSummary {
  account: Account;
  amount: number;
  percentage: number;
  categoryTypeBreakdown: {
    type: CategoryType;
    percentage: number;
  }[];
}

export interface BudgetSummary {
  totalIncome: number;
  budgetedExpenses: number; // needs + wants
  monthlySavings: number; // savings
  nonAllocated: number; // totalIncome - (budgetedExpenses + monthlySavings)
  allocatedPercent: number; // (budgetedExpenses + monthlySavings) / totalIncome
  totalSpending: number; // total transactions this month
  needsSubtotal: number;
  wantsSubtotal: number;
  savingsSubtotal: number;
  needsPercent: number;
  wantsPercent: number;
  savingsPercent: number;
}
