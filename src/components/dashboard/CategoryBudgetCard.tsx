import React from 'react';
import type { CategoryProgress } from '../../types';

interface CategoryBudgetCardProps {
  progressList: CategoryProgress[];
}

export const CategoryBudgetCard: React.FC<CategoryBudgetCardProps> = ({ progressList }) => {
  // Only display categories that have an allocation > 0 or realization > 0
  const activeBudgeted = progressList.filter(
    (p) => (p.allocation > 0 || p.realization > 0) && p.category.isActive
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
      <h2 className="text-base font-bold text-slate-800 dark:text-white">Anggaran per kategori</h2>

      <div className="space-y-4">
        {activeBudgeted.map((item) => {
          const clampedPercent = Math.min(100, Math.max(0, item.usagePercent));

          // Color thresholds:
          // green: < 80%
          // yellow: 80 - 99%
          // red: >= 100%
          let barBg = 'bg-[#18784E] dark:bg-emerald-500'; // exact deep emerald from wireframe
          if (item.statusColor === 'red') {
            barBg = 'bg-[#B91C1C] dark:bg-red-500'; // red
          } else if (item.statusColor === 'yellow') {
            barBg = 'bg-[#D97706] dark:bg-amber-500'; // yellow/amber
          }

          return (
            <div key={item.category.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {item.category.name}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {item.realization.toLocaleString('id-ID')} / {item.allocation.toLocaleString('id-ID')} · {item.usagePercent}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barBg}`}
                  style={{ width: `${clampedPercent}%` }}
                />
              </div>
            </div>
          );
        })}

        {activeBudgeted.length === 0 && (
          <p className="text-xs text-slate-400 py-3 text-center">
            Belum ada anggaran yang dialokasikan bulan ini.
          </p>
        )}
      </div>

      {/* Footer Legend */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center font-medium">
          Hijau &lt; 80% · Kuning 80–99% · Merah ≥ 100%
        </p>
      </div>
    </div>
  );
};
