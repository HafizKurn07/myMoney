import React from 'react';
import type { Asset } from '../../types';

interface AssetCompositionBarProps {
  assets: Asset[];
}

const TYPE_COLORS: Record<string, string> = {
  Tabungan: '#18784E', // forest green
  Saham: '#EAB308', // amber/yellow
  'Reksa Dana': '#06B6D4', // cyan
  Obligasi: '#6366F1', // indigo
  Deposito: '#10B981', // emerald
  BPJS: '#F97316', // orange
  Lainnya: '#94A3B8', // slate
};

export const AssetCompositionBar: React.FC<AssetCompositionBarProps> = ({ assets }) => {
  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

  // Group values by assetType
  const grouped = new Map<string, number>();
  for (const asset of assets) {
    const type = asset.assetType || 'Lainnya';
    grouped.set(type, (grouped.get(type) || 0) + (asset.value || 0));
  }

  // Convert to array and sort descending
  const items = Array.from(grouped.entries())
    .map(([type, value]) => {
      const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
      return {
        type,
        value,
        percentage,
        color: TYPE_COLORS[type] || '#64748B',
      };
    })
    .sort((a, b) => b.value - a.value);

  if (totalValue === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-2">Komposisi per jenis</h2>
        <p className="text-xs text-slate-400 py-2 text-center">Belum ada aset tercatat.</p>
      </div>
    );
  }

  // Text summary matching wireframe: "Tabungan 98% · Saham 1,2% · Lainnya 0,4%"
  const textSummary = items
    .slice(0, 3)
    .map((item) => `${item.type} ${item.percentage < 1 && item.percentage > 0 ? item.percentage.toFixed(1).replace('.', ',') : Math.round(item.percentage)}%`)
    .join(' · ');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-white">Komposisi per jenis</h2>

      {/* Multi-segmented Bar */}
      <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
        {items.map((item) => (
          <div
            key={item.type}
            style={{
              width: `${item.percentage}%`,
              backgroundColor: item.color,
            }}
            className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full"
            title={`${item.type}: ${item.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Subtitle description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
        {textSummary}
        {items.length > 3 ? ` · Lainnya ${(100 - items.slice(0, 3).reduce((s, i) => s + i.percentage, 0)).toFixed(1).replace('.', ',')}%` : ''}
      </p>
    </div>
  );
};
