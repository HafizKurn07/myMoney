import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/common/MonthSelector';
import { PaydayBanner } from '../components/dashboard/PaydayBanner';
import { MetricCards } from '../components/dashboard/MetricCards';
import { CategoryBudgetCard } from '../components/dashboard/CategoryBudgetCard';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { SpendingTrendChart } from '../components/dashboard/SpendingTrendChart';
import { AccountTransfersCard } from '../components/dashboard/AccountTransfersCard';
import { monthlyIncomeRepository } from '../db/repositories/monthlyIncomeRepository';
import { allocationRepository } from '../db/repositories/allocationRepository';
import { categoryRepository } from '../db/repositories/categoryRepository';
import { accountRepository } from '../db/repositories/accountRepository';
import { transactionRepository } from '../db/repositories/transactionRepository';
import {
  calculateBudgetSummary,
  calculateCategoryProgress,
  calculateAccountTransfers,
} from '../utils/calculations';
import type {
  MonthlyIncome,
  Allocation,
  Category,
  Account,
  Transaction,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { activeYear, activeMonth, settings } = useApp();

  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyTrendTotals, setMonthlyTrendTotals] = useState<number[]>(new Array(12).fill(0));
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [incList, allocList, catList, accList, trxList, allTrxList] = await Promise.all([
      monthlyIncomeRepository.getByMonth(activeYear, activeMonth),
      allocationRepository.getByMonth(activeYear, activeMonth),
      categoryRepository.getAll(),
      accountRepository.getActive(),
      transactionRepository.getByMonth(activeYear, activeMonth),
      transactionRepository.getAll(),
    ]);

    setIncomes(incList);
    setAllocations(allocList);
    setCategories(catList);
    setAccounts(accList);
    setTransactions(trxList);

    // Compute 12-month spending trend for activeYear
    const trend = new Array(12).fill(0);
    for (const trx of allTrxList) {
      if (trx.date && trx.date.startsWith(`${activeYear}-`)) {
        const parts = trx.date.split('-');
        const monthNum = parseInt(parts[1], 10);
        if (monthNum >= 1 && monthNum <= 12) {
          trend[monthNum - 1] += trx.amount || 0;
        }
      }
    }
    setMonthlyTrendTotals(trend);
    setIsLoading(false);
  }, [activeYear, activeMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const summary = calculateBudgetSummary(incomes, allocations, categories, transactions);
  const categoryProgress = calculateCategoryProgress(categories, allocations, transactions);
  const accountTransfers = calculateAccountTransfers(accounts, categories, allocations, summary.totalIncome);
  const paydayDay = settings?.paydayDay ?? 25;

  return (
    <div className="p-4 space-y-4">
      {/* 1. Header with Month Selector */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Dashboard
        </h1>
        <MonthSelector />
      </div>

      {/* 2. Banner Countdown Gajian */}
      <PaydayBanner paydayDay={paydayDay} />

      {/* 3. 4 Kartu Metrik & Bar Belum Dialokasikan */}
      <MetricCards summary={summary} />

      {/* 4. Kartu Anggaran per Kategori */}
      <CategoryBudgetCard progressList={categoryProgress} />

      {/* 5. Donut Chart Komposisi Pengeluaran */}
      <CategoryDonutChart progressList={categoryProgress} />

      {/* 6. Tren Pengeluaran 12 Bulan */}
      <SpendingTrendChart
        monthlyTotals={monthlyTrendTotals}
        activeMonth={activeMonth}
      />

      {/* 7. Kartu Transfer per Rekening Bulan Ini */}
      <AccountTransfersCard transfers={accountTransfers} />
    </div>
  );
};
