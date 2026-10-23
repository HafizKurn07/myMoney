import { db } from '../db';
import type { Category, CategoryType } from '../../types';

export const categoryRepository = {
  async getAll(): Promise<Category[]> {
    return await db.categories.orderBy('sortOrder').toArray();
  },

  async getActive(): Promise<Category[]> {
    const all = await db.categories.orderBy('sortOrder').toArray();
    return all.filter((c) => c.isActive);
  },

  async getByType(type: CategoryType): Promise<Category[]> {
    const all = await db.categories.where('type').equals(type).toArray();
    return all.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async create(category: Omit<Category, 'id'> & { id?: string }): Promise<Category> {
    const id = category.id || crypto.randomUUID();
    const newCategory: Category = {
      ...category,
      id,
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    };
    await db.categories.put(newCategory);
    return newCategory;
  },

  async update(id: string, updates: Partial<Category>): Promise<void> {
    await db.categories.update(id, updates);
  },

  async deleteOrDeactivate(id: string): Promise<{ deactivated: boolean }> {
    // Check if category is used in allocations or transactions
    const allocationsCount = await db.allocations.where('categoryId').equals(id).count();
    const transactionsCount = await db.transactions.where('categoryId').equals(id).count();

    if (allocationsCount > 0 || transactionsCount > 0) {
      // Keep transaction history intact by just deactivating
      await db.categories.update(id, { isActive: false });
      return { deactivated: true };
    }

    await db.categories.delete(id);
    return { deactivated: false };
  },
};
