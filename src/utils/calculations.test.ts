import { describe, it, expect } from 'vitest';
import {
  calculateBudgetSummary,
  calculateCategoryProgress,
  calculateAccountTransfers,
  calculatePaydayCountdown,
  calculateAssetProgress,
  prepareCopyFromPreviousMonth,
} from './calculations';
import type { Category, Allocation, MonthlyIncome, Transaction, Account, Asset } from '../types';

describe('Financial Calculations', () => {
  const dummyCategories: Category[] = [
    { id: 'cat-food', name: 'Food', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 1 },
    { id: 'cat-supplies', name: 'Supplies', type: 'needs', accountId: 'acc-bca', isActive: true, sortOrder: 2 },
    { id: 'cat-entertainment', name: 'Entertainment', type: 'wants', accountId: 'acc-jago', isActive: true, sortOrder: 3 },
    { id: 'cat-savings', name: 'Savings', type: 'savings', accountId: 'acc-bibit', isActive: true, sortOrder: 4 },
  ];

  const dummyAccounts: Account[] = [
    { id: 'acc-bca', name: 'BCA', isActive: true, sortOrder: 1 },
    { id: 'acc-jago', name: 'Jago', isActive: true, sortOrder: 2 },
    { id: 'acc-bibit', name: 'Bibit', isActive: true, sortOrder: 3 },
  ];

  it('1. correctly computes nonAllocated and summary totals', () => {
    const incomes: MonthlyIncome[] = [
      { id: '1', year: 2024, month: 1, incomeSourceId: 'src-1', amount: 6943000 },
    ];
    const allocations: Allocation[] = [
      { id: '1', year: 2024, month: 1, categoryId: 'cat-food', amount: 600000 },
      { id: '2', year: 2024, month: 1, categoryId: 'cat-supplies', amount: 500000 },
      { id: '3', year: 2024, month: 1, categoryId: 'cat-entertainment', amount: 200000 },
      { id: '4', year: 2024, month: 1, categoryId: 'cat-savings', amount: 1500000 },
    ];
    const transactions: Transaction[] = [
      { id: 't1', date: '2024-01-05', categoryId: 'cat-food', amount: 300000, isChecked: false, createdAt: '' },
    ];

    const result = calculateBudgetSummary(incomes, allocations, dummyCategories, transactions);

    expect(result.totalIncome).toBe(6943000);
    // Needs + Wants: 600k + 500k + 200k = 1300k
    expect(result.budgetedExpenses).toBe(1300000);
    // Savings: 1500k
    expect(result.monthlySavings).toBe(1500000);
    // nonAllocated: 6943000 - (1300000 + 1500000) = 4143000
    expect(result.nonAllocated).toBe(4143000);
    expect(result.totalSpending).toBe(300000);
  });

  it('1b. correctly handles negative nonAllocated when over-budgeted', () => {
    const incomes: MonthlyIncome[] = [
      { id: '1', year: 2024, month: 1, incomeSourceId: 'src-1', amount: 1000000 },
    ];
    const allocations: Allocation[] = [
      { id: '1', year: 2024, month: 1, categoryId: 'cat-food', amount: 800000 },
      { id: '2', year: 2024, month: 1, categoryId: 'cat-savings', amount: 500000 },
    ];

    const result = calculateBudgetSummary(incomes, allocations, dummyCategories, []);
    // totalAllocated = 1.300.000, totalIncome = 1.000.000 -> nonAllocated = -300.000
    expect(result.nonAllocated).toBe(-300000);
  });

  it('2. correctly computes usagePercent and statusColor thresholds', () => {
    const allocations: Allocation[] = [
      { id: '1', year: 2024, month: 1, categoryId: 'cat-food', amount: 600000 }, // 473.000 -> 79% (green)
      { id: '2', year: 2024, month: 1, categoryId: 'cat-supplies', amount: 500000 }, // 400.000 -> 80% (yellow)
      { id: '3', year: 2024, month: 1, categoryId: 'cat-entertainment', amount: 200000 }, // 200.000 -> 100% (red)
      { id: '4', year: 2024, month: 1, categoryId: 'cat-savings', amount: 0 }, // 0 alloc -> 0% (green)
    ];

    const transactions: Transaction[] = [
      { id: 't1', date: '2024-01-01', categoryId: 'cat-food', amount: 473000, isChecked: false, createdAt: '' },
      { id: 't2', date: '2024-01-02', categoryId: 'cat-supplies', amount: 400000, isChecked: false, createdAt: '' },
      { id: 't3', date: '2024-01-03', categoryId: 'cat-entertainment', amount: 200000, isChecked: false, createdAt: '' },
    ];

    const progress = calculateCategoryProgress(dummyCategories, allocations, transactions);
    const food = progress.find((p) => p.category.id === 'cat-food')!;
    const supplies = progress.find((p) => p.category.id === 'cat-supplies')!;
    const entertainment = progress.find((p) => p.category.id === 'cat-entertainment')!;
    const savings = progress.find((p) => p.category.id === 'cat-savings')!;

    // Green: < 80%
    expect(food.usagePercent).toBe(79);
    expect(food.statusColor).toBe('green');
    expect(food.remaining).toBe(127000);

    // Yellow: 80% - 99%
    expect(supplies.usagePercent).toBe(80);
    expect(supplies.statusColor).toBe('yellow');

    // Red: >= 100%
    expect(entertainment.usagePercent).toBe(100);
    expect(entertainment.statusColor).toBe('red');

    // Allocation 0
    expect(savings.usagePercent).toBe(0);
    expect(savings.statusColor).toBe('green');
  });

  it('3. correctly computes total transfer per rekening bulan ini', () => {
    const allocations: Allocation[] = [
      { id: '1', year: 2024, month: 1, categoryId: 'cat-food', amount: 600000 }, // BCA
      { id: '2', year: 2024, month: 1, categoryId: 'cat-supplies', amount: 500000 }, // BCA
      { id: '3', year: 2024, month: 1, categoryId: 'cat-entertainment', amount: 200000 }, // Jago
      { id: '4', year: 2024, month: 1, categoryId: 'cat-savings', amount: 1500000 }, // Bibit
    ];
    const totalIncome = 6943000;

    const transfers = calculateAccountTransfers(dummyAccounts, dummyCategories, allocations, totalIncome);
    const bca = transfers.find((t) => t.account.id === 'acc-bca')!;
    const jago = transfers.find((t) => t.account.id === 'acc-jago')!;
    const bibit = transfers.find((t) => t.account.id === 'acc-bibit')!;

    expect(bca.amount).toBe(1100000); // 600k + 500k
    expect(jago.amount).toBe(200000);
    expect(bibit.amount).toBe(1500000);
  });

  it('4. computes payday countdown accurately', () => {
    // Exactly payday
    const paydayDay = 25;
    const sameDay = new Date(2024, 0, 25);
    const result1 = calculatePaydayCountdown(paydayDay, sameDay);
    expect(result1.isPaydayToday).toBe(true);
    expect(result1.daysRemaining).toBe(0);

    // 3 days before payday (Jan 22)
    const before = new Date(2024, 0, 22);
    const result2 = calculatePaydayCountdown(paydayDay, before);
    expect(result2.isPaydayToday).toBe(false);
    expect(result2.daysRemaining).toBe(3);
  });

  it('5. computes asset progress', () => {
    const assets: Asset[] = [
      { id: '1', name: 'Tabungan', value: 300000000, liquidity: 'liquid', assetType: 'Tabungan', updatedAt: '2024-01-01' },
      { id: '2', name: 'Saham', value: 30000000, liquidity: 'non_liquid', assetType: 'Saham', updatedAt: '2024-01-01' },
    ];
    const target = 1500000000;
    const result = calculateAssetProgress(assets, target);
    expect(result.totalAsset).toBe(330000000);
    expect(result.progressPercent).toBe(22);
  });

  it('6. correctly prepares copy of income and allocations from previous month', () => {
    const prevIncomes: MonthlyIncome[] = [
      { id: 'inc-1', year: 2024, month: 1, incomeSourceId: 'src-gaji', amount: 6593000 },
    ];
    const prevAllocations: Allocation[] = [
      { id: 'alloc-1', year: 2024, month: 1, categoryId: 'cat-food', amount: 600000 },
      { id: 'alloc-2', year: 2024, month: 1, categoryId: 'cat-bills', amount: 500000 },
    ];

    const { newIncomes, newAllocations } = prepareCopyFromPreviousMonth(prevIncomes, prevAllocations, 2024, 2);

    expect(newIncomes).toHaveLength(1);
    expect(newIncomes[0].year).toBe(2024);
    expect(newIncomes[0].month).toBe(2);
    expect(newIncomes[0].amount).toBe(6593000);

    expect(newAllocations).toHaveLength(2);
    expect(newAllocations[0].month).toBe(2);
    expect(newAllocations[0].amount).toBe(600000);
    expect(newAllocations[1].month).toBe(2);
    expect(newAllocations[1].amount).toBe(500000);
  });
});

