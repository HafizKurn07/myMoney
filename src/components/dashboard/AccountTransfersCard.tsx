import React from 'react';
import type { AccountTransferSummary } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface AccountTransfersCardProps {
  transfers: AccountTransferSummary[];
}

export const AccountTransfersCard: React.FC<AccountTransfersCardProps> = ({ transfers }) => {
  // Only accounts with transfers > 0
  const activeTransfers = transfers.filter((t) => t.amount > 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
      <h2 className="text-base font-bold text-slate-800 dark:text-white">
        Transfer per rekening bulan ini
      </h2>

      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {activeTransfers.map((item) => {
          // Format breakdown text, e.g. "Needs 38,9%"
          const breakdownText = item.categoryTypeBreakdown
            .map(
              (b) =>
                `${b.type.charAt(0).toUpperCase() + b.type.slice(1)} ${b.percentage
                  .toFixed(1)
                  .replace('.', ',')}%`
            )
            .join(', ');

          return (
            <div key={item.account.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {item.account.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {breakdownText || `${item.percentage.toFixed(1).replace('.', ',')}%`}
                </p>
              </div>

              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatRupiah(item.amount)}
              </span>
            </div>
          );
        })}

        {activeTransfers.length === 0 && (
          <p className="text-xs text-slate-400 py-3 text-center">
            Belum ada rencana transfer ke rekening untuk bulan ini.
          </p>
        )}
      </div>
    </div>
  );
};
