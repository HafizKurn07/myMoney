import React from 'react';
import type { BudgetSummary } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface MetricCardsProps {
  summary: BudgetSummary;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  return (
    <div className="space-y-3">
      {/* 4 Cards Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Income */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Income
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(summary.totalIncome)}
          </p>
        </div>

        {/* Budgeted Expenses */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Budgeted Expenses
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(summary.budgetedExpenses)}
          </p>
        </div>

        {/* Total Spending */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Total Spending
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(summary.totalSpending)}
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
            Monthly Savings
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatRupiah(summary.monthlySavings)}
          </p>
        </div>
      </div>

      {/* Belum Dialokasikan Bar */}
      <div className="bg-white dark:bg-slate-800 px-5 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-soft flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Belum dialokasikan
        </span>
        <span
          className={`text-base font-extrabold tracking-tight ${
            summary.nonAllocated < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {formatRupiah(summary.nonAllocated)}
        </span>
      </div>
    </div>
  );
};
