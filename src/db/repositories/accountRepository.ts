import { db } from '../db';
import type { Account } from '../../types';

export const accountRepository = {
  async getAll(): Promise<Account[]> {
    return await db.accounts.orderBy('sortOrder').toArray();
  },

  async getActive(): Promise<Account[]> {
    const all = await db.accounts.orderBy('sortOrder').toArray();
    return all.filter((a) => a.isActive);
  },

  async getById(id: string): Promise<Account | undefined> {
    return await db.accounts.get(id);
  },

  async create(account: Omit<Account, 'id'> & { id?: string }): Promise<Account> {
    const id = account.id || crypto.randomUUID();
    const newAccount: Account = {
      ...account,
      id,
      isActive: account.isActive ?? true,
      sortOrder: account.sortOrder ?? 0,
    };
    await db.accounts.put(newAccount);
    return newAccount;
  },

  async update(id: string, updates: Partial<Account>): Promise<void> {
    await db.accounts.update(id, updates);
  },

  async deleteOrDeactivate(id: string): Promise<{ deactivated: boolean }> {
    // Check if account is used in categories or assets
    const categoriesCount = await db.categories.where('accountId').equals(id).count();
    const assetsCount = await db.assets.where('accountId').equals(id).count();

    if (categoriesCount > 0 || assetsCount > 0) {
      // Deactivate instead of deleting
      await db.accounts.update(id, { isActive: false });
      return { deactivated: true };
    }

    await db.accounts.delete(id);
    return { deactivated: false };
  },
};
