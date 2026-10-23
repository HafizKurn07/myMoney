import { db } from '../db';
import type { Transaction } from '../../types';

export const transactionRepository = {
  async getAll(): Promise<Transaction[]> {
    return await db.transactions.reverse().sortBy('date');
  },

  async getByMonth(year: number, month: number): Promise<Transaction[]> {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const startDate = `${year}-${monthStr}-01`;
    // End date calculation
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${lastDay < 10 ? '0' + lastDay : lastDay}`;

    return await db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .reverse()
      .sortBy('date');
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  },

  async create(trx: Omit<Transaction, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<Transaction> {
    const id = trx.id || crypto.randomUUID();
    const newTrx: Transaction = {
      ...trx,
      id,
      amount: Math.max(1, Math.round(trx.amount)),
      isChecked: trx.isChecked ?? false,
      createdAt: trx.createdAt || new Date().toISOString(),
    };
    await db.transactions.put(newTrx);
    return newTrx;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    if (updates.amount !== undefined) {
      updates.amount = Math.max(1, Math.round(updates.amount));
    }
    await db.transactions.update(id, updates);
  },

  async toggleChecked(id: string): Promise<boolean> {
    const trx = await db.transactions.get(id);
    if (!trx) return false;
    const newState = !trx.isChecked;
    await db.transactions.update(id, { isChecked: newState });
    return newState;
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },
};
