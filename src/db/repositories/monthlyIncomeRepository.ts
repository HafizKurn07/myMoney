import { db } from '../db';
import type { MonthlyIncome } from '../../types';

export const monthlyIncomeRepository = {
  async getByMonth(year: number, month: number): Promise<MonthlyIncome[]> {
    return await db.monthly_incomes
      .where('[year+month]')
      .equals([year, month])
      .toArray();
  },

  async setAmount(year: number, month: number, incomeSourceId: string, amount: number): Promise<void> {
    const existing = await db.monthly_incomes
      .where('[year+month+incomeSourceId]')
      .equals([year, month, incomeSourceId])
      .first();

    if (existing) {
      await db.monthly_incomes.update(existing.id, { amount: Math.max(0, Math.round(amount)) });
    } else {
      await db.monthly_incomes.put({
        id: crypto.randomUUID(),
        year,
        month,
        incomeSourceId,
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

    const prevIncomes = await this.getByMonth(prevYear, prevMonth);
    let copiedCount = 0;

    for (const item of prevIncomes) {
      await this.setAmount(targetYear, targetMonth, item.incomeSourceId, item.amount);
      copiedCount++;
    }

    return copiedCount;
  },

  async delete(id: string): Promise<void> {
    await db.monthly_incomes.delete(id);
  },
};
