import Dexie, { type Table } from 'dexie';
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

export class HomeSweetLoanDB extends Dexie {
  accounts!: Table<Account, string>;
  income_sources!: Table<IncomeSource, string>;
  categories!: Table<Category, string>;
  monthly_incomes!: Table<MonthlyIncome, string>;
  allocations!: Table<Allocation, string>;
  transactions!: Table<Transaction, string>;
  assets!: Table<Asset, string>;
  settings!: Table<Settings, number>;

  constructor() {
    super('HomeSweetLoanDB');

    this.version(1).stores({
      accounts: 'id, name, isActive, sortOrder',
      income_sources: 'id, name, isActive, sortOrder',
      categories: 'id, name, type, accountId, isActive, sortOrder',
      monthly_incomes: 'id, [year+month], [year+month+incomeSourceId], incomeSourceId',
      allocations: 'id, [year+month], [year+month+categoryId], categoryId',
      transactions: 'id, date, categoryId, isChecked, createdAt',
      assets: 'id, name, liquidity, assetType, accountId, updatedAt',
      settings: 'id',
    });
  }
}

export const db = new HomeSweetLoanDB();
