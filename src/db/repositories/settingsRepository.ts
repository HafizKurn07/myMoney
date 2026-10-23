import { db } from '../db';
import type { Settings } from '../../types';

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  activeYear: 2024,
  paydayDay: 25,
  assetTarget: 1500000000,
};

export const settingsRepository = {
  async getSettings(): Promise<Settings> {
    const s = await db.settings.get(1);
    if (!s) {
      await db.settings.put(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return s;
  },

  async updateSettings(updates: Partial<Omit<Settings, 'id'>>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...updates };
    await db.settings.put(updated);
    return updated;
  },
};
