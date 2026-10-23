import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMonthYear } from '../../utils/formatters';

export const MonthSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { activeYear, activeMonth, setPrevMonth, setNextMonth } = useApp();

  return (
    <div
      className={`inline-flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-full px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm ${className}`}
    >
      <button
        onClick={setPrevMonth}
        className="p-1 hover:text-primary-brand dark:hover:text-emerald-400 transition-colors"
        aria-label="Bulan sebelumnya"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <span className="px-1.5 select-none">{formatMonthYear(activeYear, activeMonth)}</span>
      <button
        onClick={setNextMonth}
        className="p-1 hover:text-primary-brand dark:hover:text-emerald-400 transition-colors"
        aria-label="Bulan berikutnya"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
