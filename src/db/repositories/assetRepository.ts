import { db } from '../db';
import type { Asset, LiquidityType } from '../../types';

export const assetRepository = {
  async getAll(): Promise<Asset[]> {
    return await db.assets.toArray();
  },

  async getByLiquidity(liquidity: LiquidityType): Promise<Asset[]> {
    return await db.assets.where('liquidity').equals(liquidity).toArray();
  },

  async getById(id: string): Promise<Asset | undefined> {
    return await db.assets.get(id);
  },

  async create(asset: Omit<Asset, 'id'> & { id?: string }): Promise<Asset> {
    const id = asset.id || crypto.randomUUID();
    const newAsset: Asset = {
      ...asset,
      id,
      value: Math.max(0, Math.round(asset.value)),
      updatedAt: asset.updatedAt || new Date().toISOString().split('T')[0],
    };
    await db.assets.put(newAsset);
    return newAsset;
  },

  async update(id: string, updates: Partial<Asset>): Promise<void> {
    if (updates.value !== undefined) {
      updates.value = Math.max(0, Math.round(updates.value));
    }
    if (!updates.updatedAt) {
      updates.updatedAt = new Date().toISOString().split('T')[0];
    }
    await db.assets.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    await db.assets.delete(id);
  },
};
