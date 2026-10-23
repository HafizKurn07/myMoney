import React from 'react';
import { Calendar, PartyPopper } from 'lucide-react';
import { calculatePaydayCountdown } from '../../utils/calculations';

interface PaydayBannerProps {
  paydayDay: number;
}

export const PaydayBanner: React.FC<PaydayBannerProps> = ({ paydayDay }) => {
  const { daysRemaining, isPaydayToday } = calculatePaydayCountdown(paydayDay);

  if (isPaydayToday) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-4 shadow-soft flex items-center justify-between border border-emerald-500/30 animate-pulse">
        <div className="flex items-center gap-2.5">
          <PartyPopper className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-bold tracking-tight">Hari ini gajian! 🎉</span>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white/20 rounded-full">
          Tanggal {paydayDay}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-soft flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-emerald-950/40 text-primary-brand dark:text-emerald-400 flex items-center justify-center">
          <Calendar className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-white">
          Gajian {daysRemaining} hari lagi
        </span>
      </div>
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
        Tanggal {paydayDay}
      </span>
    </div>
  );
};
