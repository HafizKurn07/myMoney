import React, { useState } from 'react';
import { Sun, Moon, Sparkles, Tag, Landmark, Target, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategorySettings } from '../components/settings/CategorySettings';
import { AccountSettings } from '../components/settings/AccountSettings';
import { IncomeSourceSettings } from '../components/settings/IncomeSourceSettings';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { DataManagement } from '../components/settings/DataManagement';
import { InstallPrompt } from '../components/pwa/InstallPrompt';

type SettingsTab = 'category' | 'account' | 'general' | 'data';

export const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('category');

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'category', label: 'Kategori', icon: Tag },
    { id: 'account', label: 'Akun', icon: Landmark },
    { id: 'general', label: 'Target', icon: Target },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-brand dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Data & Preferensi</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Pengaturan</h1>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-soft text-slate-600 dark:text-slate-300 hover:text-primary-brand dark:hover:text-emerald-400 transition-colors"
          title={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
      {/* PWA Install Banner */}
      <InstallPrompt />

      {/* Navigation Pills (4-column grid for mobile) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-2xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-primary-brand dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] sm:text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content depending on active tab */}
      <div className="space-y-4">
        {activeTab === 'category' && <CategorySettings />}

        {activeTab === 'account' && (
          <div className="space-y-4">
            <AccountSettings />
            <IncomeSourceSettings />
          </div>
        )}

        {activeTab === 'general' && <GeneralSettings />}

        {activeTab === 'data' && <DataManagement />}
      </div>
    </div>
  );
};
