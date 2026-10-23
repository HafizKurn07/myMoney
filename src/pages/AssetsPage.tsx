import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssetModal } from '../components/assets/AssetModal';
import { AssetCompositionBar } from '../components/assets/AssetCompositionBar';
import { MonthlyRecapTable, type MonthlyRecapItem } from '../components/assets/MonthlyRecapTable';
import { Modal } from '../components/ui/Modal';
import { assetRepository } from '../db/repositories/assetRepository';
import { accountRepository } from '../db/repositories/accountRepository';
import { monthlyIncomeRepository } from '../db/repositories/monthlyIncomeRepository';
import { allocationRepository } from '../db/repositories/allocationRepository';
import { categoryRepository } from '../db/repositories/categoryRepository';
import { transactionRepository } from '../db/repositories/transactionRepository';
import { formatRupiah, formatDateShort } from '../utils/formatters';
import { calculateAssetProgress } from '../utils/calculations';
import type { Asset, Account, LiquidityType } from '../types';

export const AssetsPage: React.FC = () => {
  const { activeYear, settings } = useApp();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recapData, setRecapData] = useState<MonthlyRecapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [modalLiquidity, setModalLiquidity] = useState<LiquidityType>('liquid');
  const [deleteCandidate, setDeleteCandidate] = useState<Asset | null>(null);

  const loadData = useCallback(async () => {
    const [assetList, accountList, allCategories, allTransactions] =
      await Promise.all([
        assetRepository.getAll(),
        accountRepository.getActive(),
        categoryRepository.getAll(),
        transactionRepository.getAll(),
      ]);

    setAssets(assetList);
    setAccounts(accountList);

    // Compute monthly recap for activeYear (months 1 - 12)
    const savingsCatIds = new Set(
      allCategories.filter((c) => c.type === 'savings').map((c) => c.id)
    );

    const recaps: MonthlyRecapItem[] = [];

    // Pre-calculate per month
    for (let m = 1; m <= 12; m++) {
      // Incomes
      const monthIncomes = await monthlyIncomeRepository.getByMonth(activeYear, m);
      const incTotal = monthIncomes.reduce((sum, item) => sum + (item.amount || 0), 0);

      // Savings allocations
      const monthAllocations = await allocationRepository.getByMonth(activeYear, m);
      const savTotal = monthAllocations
        .filter((a) => savingsCatIds.has(a.categoryId))
        .reduce((sum, a) => sum + (a.amount || 0), 0);

      // Expenses transactions
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const prefix = `${activeYear}-${monthStr}-`;
      const expTotal = allTransactions
        .filter((t) => t.date && t.date.startsWith(prefix))
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      recaps.push({
        month: m,
        income: incTotal,
        savings: savTotal,
        expenses: expTotal,
      });
    }

    setRecapData(recaps);
    setIsLoading(false);
  }, [activeYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const accountMap = useMemo(() => {
    return new Map<string, Account>(accounts.map((a) => [a.id, a]));
  }, [accounts]);

  // Asset target and progress
  const assetTarget = settings?.assetTarget || 1500000000;
  const { totalAsset, progressPercent } = calculateAssetProgress(assets, assetTarget);

  // Filter liquid and non-liquid
  const liquidAssets = useMemo(() => assets.filter((a) => a.liquidity === 'liquid'), [assets]);
  const nonLiquidAssets = useMemo(() => assets.filter((a) => a.liquidity === 'non_liquid'), [assets]);

  const handleOpenAddModal = (liquidity: LiquidityType) => {
    setEditingAsset(null);
    setModalLiquidity(liquidity);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setModalLiquidity(asset.liquidity);
    setIsModalOpen(true);
  };

  const handleSaveAsset = async (assetData: Omit<Asset, 'id'> & { id?: string }) => {
    if (assetData.id) {
      await assetRepository.update(assetData.id, assetData);
    } else {
      await assetRepository.create(assetData);
    }
    await loadData();
  };

  const handleDeleteAsset = async () => {
    if (!deleteCandidate) return;
    await assetRepository.delete(deleteCandidate.id);
    setDeleteCandidate(null);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  const renderAssetList = (items: Asset[]) => {
    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {items.map((asset) => {
          const acc = asset.accountId ? accountMap.get(asset.accountId) : undefined;
          const subtitleParts = [asset.assetType];
          if (acc) subtitleParts.push(acc.name);
          if (asset.updatedAt) subtitleParts.push(formatDateShort(asset.updatedAt));

          return (
            <div key={asset.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {asset.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {subtitleParts.join(' · ')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatRupiah(asset.value)}
                </span>
                <div className="flex items-center gap-1 opacity-70 hover:opacity-100">
                  <button
                    onClick={() => handleOpenEditModal(asset)}
                    className="p-1 text-slate-400 hover:text-primary-brand transition-colors"
                    title="Ubah"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(asset)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada aset tercatat.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Aset</h1>
      </div>

      {/* 1. Kartu Total Aset & Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
          Total aset
        </span>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatRupiah(totalAsset)}
        </p>

        {/* Progress Bar Container */}
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-brand dark:bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {progressPercent}% dari target {formatRupiah(assetTarget)}
        </p>
      </div>

      {/* 2. Bagian Liquid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Liquid</h2>
        {renderAssetList(liquidAssets)}
        <button
          onClick={() => handleOpenAddModal('liquid')}
          className="w-full py-2.5 rounded-xl border border-primary-brand/40 dark:border-emerald-600/40 text-primary-brand dark:text-emerald-400 text-xs font-bold hover:bg-primary-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-1.5 transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah aset</span>
        </button>
      </div>

      {/* 3. Bagian Non-Liquid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Non-Liquid</h2>
        {renderAssetList(nonLiquidAssets)}
        <button
          onClick={() => handleOpenAddModal('non_liquid')}
          className="w-full py-2.5 rounded-xl border border-primary-brand/40 dark:border-emerald-600/40 text-primary-brand dark:text-emerald-400 text-xs font-bold hover:bg-primary-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-1.5 transition-colors mt-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah aset</span>
        </button>
      </div>

      {/* 4. Komposisi per jenis aset */}
      <AssetCompositionBar assets={assets} />

      {/* 5. Rekap Bulanan Income / Savings / Expenses */}
      <MonthlyRecapTable recapData={recapData} />

      {/* Modal Tambah / Edit Aset */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        accounts={accounts}
        initialLiquidity={modalLiquidity}
      />

      {/* Modal Konfirmasi Hapus Aset */}
      <Modal
        isOpen={deleteCandidate !== null}
        onClose={() => setDeleteCandidate(null)}
        title="Hapus Aset"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <p className="font-semibold">Apakah Anda yakin ingin menghapus aset ini?</p>
              <p className="mt-1">
                "{deleteCandidate?.name}" dengan nilai{' '}
                <strong>{formatRupiah(deleteCandidate?.value || 0)}</strong>
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteCandidate(null)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteAsset}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
