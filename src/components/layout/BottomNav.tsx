import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ReceiptText, Landmark, Settings } from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Budget', to: '/budget', icon: Wallet },
  { name: 'Transaksi', to: '/transaksi', icon: ReceiptText },
  { name: 'Aset', to: '/aset', icon: Landmark },
  { name: 'Pengaturan', to: '/pengaturan', icon: Settings },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[430px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-primary-brand dark:text-emerald-400 font-semibold scale-105'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-normal'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50 dark:bg-emerald-950/40' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                  </div>
                  <span className="text-[11px] mt-0.5 tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
