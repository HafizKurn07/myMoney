import { db } from '../db';
import type { Allocation } from '../../types';

export const allocationRepository = {
  async getByMonth(year: number, month: number): Promise<Allocation[]> {
    return await db.allocations
      .where('[year+month]')
      .equals([year, month])
      .toArray();
  },

  async setAmount(year: number, month: number, categoryId: string, amount: number): Promise<void> {
    const existing = await db.allocations
      .where('[year+month+categoryId]')
      .equals([year, month, categoryId])
      .first();

    if (existing) {
      await db.allocations.update(existing.id, { amount: Math.max(0, Math.round(amount)) });
    } else {
      await db.allocations.put({
        id: crypto.randomUUID(),
        year,
        month,
        categoryId,
        amount: Math.max(0, Math.round(amount)),
      });
    }
  },

  async copyFromPreviousMonth(targetYear: number, targetMonth: number): Promise<number> {
    let prevYear = targetYear;
    let prevMonth = targetMonth - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const prevAllocations = await this.getByMonth(prevYear, prevMonth);
    let copiedCount = 0;

    for (const item of prevAllocations) {
      await this.setAmount(targetYear, targetMonth, item.categoryId, item.amount);
      copiedCount++;
    }

    return copiedCount;
  },

  async delete(id: string): Promise<void> {
    await db.allocations.delete(id);
  },
};
