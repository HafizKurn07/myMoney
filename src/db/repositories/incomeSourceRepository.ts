import { db } from '../db';
import type { IncomeSource } from '../../types';

export const incomeSourceRepository = {
  async getAll(): Promise<IncomeSource[]> {
    return await db.income_sources.orderBy('sortOrder').toArray();
  },

  async getActive(): Promise<IncomeSource[]> {
    const all = await db.income_sources.orderBy('sortOrder').toArray();
    return all.filter((s) => s.isActive);
  },

  async getById(id: string): Promise<IncomeSource | undefined> {
    return await db.income_sources.get(id);
  },

  async create(source: Omit<IncomeSource, 'id'> & { id?: string }): Promise<IncomeSource> {
    const id = source.id || crypto.randomUUID();
    const newSource: IncomeSource = {
      ...source,
      id,
      isActive: source.isActive ?? true,
      sortOrder: source.sortOrder ?? 0,
    };
    await db.income_sources.put(newSource);
    return newSource;
  },

  async update(id: string, updates: Partial<IncomeSource>): Promise<void> {
    await db.income_sources.update(id, updates);
  },

  async deleteOrDeactivate(id: string): Promise<{ deactivated: boolean }> {
    // Check if income source is used in monthly_incomes
    const incomesCount = await db.monthly_incomes.where('incomeSourceId').equals(id).count();

    if (incomesCount > 0) {
      await db.income_sources.update(id, { isActive: false });
      return { deactivated: true };
    }

    await db.income_sources.delete(id);
    return { deactivated: false };
  },
};
