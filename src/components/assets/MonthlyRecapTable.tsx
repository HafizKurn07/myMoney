import React from 'react';
import { MONTH_SHORT_ID } from '../../utils/formatters';

export interface MonthlyRecapItem {
  month: number;
  income: number;
  savings: number;
  expenses: number;
}

interface MonthlyRecapTableProps {
  recapData: MonthlyRecapItem[];
}

export const MonthlyRecapTable: React.FC<MonthlyRecapTableProps> = ({ recapData }) => {
  const recapMap = new Map<number, MonthlyRecapItem>(recapData.map((r) => [r.month, r]));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-white">Rekap bulanan</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <th className="py-2 pr-3">Bulan</th>
              <th className="py-2 px-2 text-right">Income</th>
              <th className="py-2 px-2 text-right">Savings</th>
              <th className="py-2 pl-2 text-right">Expenses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-xs">
            {MONTH_SHORT_ID.map((shortName, idx) => {
              const monthNum = idx + 1;
              const item = recapMap.get(monthNum);
              const hasData = item && (item.income > 0 || item.savings > 0 || item.expenses > 0);

              return (
                <tr
                  key={shortName}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors ${
                    hasData ? 'font-medium text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  <td className="py-2.5 pr-3 font-semibold">{shortName}</td>
                  <td className="py-2.5 px-2 text-right">
                    {item && item.income > 0 ? item.income.toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    {item && item.savings > 0 ? item.savings.toLocaleString('id-ID') : '-'}
                  </td>
                  <td className="py-2.5 pl-2 text-right">
                    {item && item.expenses > 0 ? item.expenses.toLocaleString('id-ID') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
