import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Settings } from '../types';
import { settingsRepository } from '../db/repositories/settingsRepository';
import { initSeedDataIfEmpty } from '../db/seed';

interface AppContextType {
  activeYear: number;
  activeMonth: number;
  setActiveYear: (year: number) => void;
  setActiveMonth: (month: number) => void;
  setNextMonth: () => void;
  setPrevMonth: () => void;
  settings: Settings | null;
  refreshSettings: () => Promise<void>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to January 2024 to match seed data
  const [activeYear, setActiveYear] = useState<number>(2024);
  const [activeMonth, setActiveMonth] = useState<number>(1);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const refreshSettings = async () => {
    const s = await settingsRepository.getSettings();
    setSettings(s);
  };

  useEffect(() => {
    async function initialize() {
      await initSeedDataIfEmpty();
      await refreshSettings();
      setIsReady(true);
    }
    initialize();
  }, []);

  const setNextMonth = () => {
    if (activeMonth === 12) {
      setActiveMonth(1);
      setActiveYear((y) => y + 1);
    } else {
      setActiveMonth((m) => m + 1);
    }
  };

  const setPrevMonth = () => {
    if (activeMonth === 1) {
      setActiveMonth(12);
      setActiveYear((y) => y - 1);
    } else {
      setActiveMonth((m) => m - 1);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeYear,
        activeMonth,
        setActiveYear,
        setActiveMonth,
        setNextMonth,
        setPrevMonth,
        settings,
        refreshSettings,
        isDarkMode,
        toggleDarkMode,
        isReady,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
