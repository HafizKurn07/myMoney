import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const { isReady } = useApp();

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Memuat Home Sweet Loan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Centered mobile container on desktop */}
      <div className="max-w-[430px] min-h-screen mx-auto bg-[#F8FAF9] dark:bg-slate-900 shadow-2xl relative flex flex-col pb-24 border-x border-slate-200/60 dark:border-slate-800">
        <main className="flex-1 w-full overflow-x-hidden">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
