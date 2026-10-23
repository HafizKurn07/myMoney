import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MONTH_SHORT_ID, formatRupiah } from '../../utils/formatters';

interface SpendingTrendChartProps {
  monthlyTotals: number[]; // Array of 12 elements (index 0 = Jan, ..., 11 = Des)
  activeMonth: number; // 1 - 12
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  monthlyTotals,
  activeMonth,
}) => {
  const chartData = MONTH_SHORT_ID.map((name, idx) => ({
    name,
    monthNum: idx + 1,
    spending: monthlyTotals[idx] || 0,
    isActiveMonth: idx + 1 === activeMonth,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-white">
        Tren pengeluaran 12 bulan
      </h2>

      <div className="w-full h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              interval={0}
            />
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
            <Bar dataKey="spending" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => {
                // Highlighting active month with deep forest green, other months soft mint/emerald or muted
                const isSelected = entry.isActiveMonth;
                const fill = isSelected ? '#18784E' : '#A7F3D0';
                return <Cell key={`bar-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
