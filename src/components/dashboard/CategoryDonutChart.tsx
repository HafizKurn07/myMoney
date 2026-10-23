import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryProgress } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface CategoryDonutChartProps {
  progressList: CategoryProgress[];
}

const COLORS = [
  '#18784E', // deep forest green
  '#22C55E', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#EC4899', // pink
  '#8B5CF6', // violet
  '#64748B', // slate
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ progressList }) => {
  // Aggregate realization (actual spending) per category
  const data = progressList
    .filter((p) => p.realization > 0)
    .map((p) => ({
      name: p.category.name,
      value: p.realization,
    }))
    .sort((a, b) => b.value - a.value);

  const totalSpending = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2">
          Komposisi pengeluaran per kategori
        </h2>
        <div className="py-8 text-center text-xs text-slate-400">
          Belum ada transaksi pengeluaran bulan ini.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut Chart */}
        <div className="w-[140px] h-[140px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val: any) => [formatRupiah(Number(val)), 'Pengeluaran']}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={65}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Category breakdown */}
        <div className="flex-1 w-full space-y-1.5">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Komposisi pengeluaran per kategori
          </h2>
          <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
            {data.slice(0, 5).map((item, idx) => {
              const pct = totalSpending > 0 ? ((item.value / totalSpending) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
            {data.length > 5 && (
              <p className="text-[10px] text-slate-400 text-right pt-0.5">
                +{data.length - 5} kategori lainnya
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
