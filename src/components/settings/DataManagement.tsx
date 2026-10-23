import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, AlertOctagon, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { db } from '../../db/db';
import { resetDatabaseToSeed } from '../../db/seed';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';

export const DataManagement: React.FC = () => {
  const { refreshSettings } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleExportJSON = async () => {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        accounts: await db.accounts.toArray(),
        income_sources: await db.income_sources.toArray(),
        categories: await db.categories.toArray(),
        monthly_incomes: await db.monthly_incomes.toArray(),
        allocations: await db.allocations.toArray(),
        transactions: await db.transactions.toArray(),
        assets: await db.assets.toArray(),
        settings: await db.settings.toArray(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `home-sweet-loan-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Backup JSON berhasil diunduh!');
    } catch {
      showNotification('Gagal mengekspor data JSON', 'error');
    }
  };

  const handleExportCSVTransactions = async () => {
    try {
      const [transactions, categories] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
      ]);
      const catMap = new Map(categories.map((c) => [c.id, c.name]));

      const headers = ['ID', 'Tanggal', 'Deskripsi', 'Kategori', 'Nominal', 'Checked', 'Dibuat'];
      const rows = transactions.map((t) => [
        t.id,
        t.date,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        `"${catMap.get(t.categoryId) || ''}"`,
        t.amount,
        t.isChecked ? 'Ya' : 'Tidak',
        t.createdAt,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaksi-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('File CSV transaksi berhasil diunduh!');
    } catch {
      showNotification('Gagal mengekspor CSV', 'error');
    }
  };

  const handleExportCSVAssets = async () => {
    try {
      const [assets, accounts] = await Promise.all([
        db.assets.toArray(),
        db.accounts.toArray(),
      ]);
      const accMap = new Map(accounts.map((a) => [a.id, a.name]));

      const headers = ['ID', 'Nama Aset', 'Likuiditas', 'Jenis Aset', 'Akun', 'Nilai', 'Terakhir Diperbarui'];
      const rows = assets.map((a) => [
        a.id,
        `"${a.name.replace(/"/g, '""')}"`,
        a.liquidity,
        `"${a.assetType}"`,
        `"${accMap.get(a.accountId || '') || '-'}"`,
        a.value,
        a.updatedAt,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aset-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('File CSV aset berhasil diunduh!');
    } catch {
      showNotification('Gagal mengekspor CSV aset', 'error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        if (!data.accounts || !data.categories) {
          throw new Error('Format file backup tidak valid');
        }

        await db.transaction('rw', [
          db.accounts,
          db.income_sources,
          db.categories,
          db.monthly_incomes,
          db.allocations,
          db.transactions,
          db.assets,
          db.settings,
        ], async () => {
          if (data.accounts) await db.accounts.bulkPut(data.accounts);
          if (data.income_sources) await db.income_sources.bulkPut(data.income_sources);
          if (data.categories) await db.categories.bulkPut(data.categories);
          if (data.monthly_incomes) await db.monthly_incomes.bulkPut(data.monthly_incomes);
          if (data.allocations) await db.allocations.bulkPut(data.allocations);
          if (data.transactions) await db.transactions.bulkPut(data.transactions);
          if (data.assets) await db.assets.bulkPut(data.assets);
          if (data.settings) await db.settings.bulkPut(data.settings);
        });

        await refreshSettings();
        showNotification('Data backup berhasil diimpor!');
        window.location.reload();
      } catch (err: unknown) {
        showNotification(`Gagal mengimpor file: ${err instanceof Error ? err.message : 'Format salah'}`, 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDatabaseToSeed();
      await refreshSettings();
      setIsResetting(false);
      setIsResetModalOpen(false);
      showNotification('Data berhasil direset ke data awal (seed)!');
      window.location.reload();
    } catch {
      setIsResetting(false);
      showNotification('Gagal mereset data', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Backup & Export */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Ekspor & Impor Data</h2>

        {notification && (
          <div
            className={`p-3 text-xs rounded-xl flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notification.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 text-primary-brand dark:text-emerald-400" />
            <span>Cadangan (JSON)</span>
          </button>

          <button
            onClick={handleExportCSVTransactions}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>CSV Transaksi</span>
          </button>

          <button
            onClick={handleExportCSVAssets}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>CSV Aset</span>
          </button>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Pulihkan / Impor Cadangan (JSON)</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50/60 dark:bg-red-950/20 rounded-2xl p-5 border border-red-200 dark:border-red-900/60 shadow-soft space-y-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-base font-bold text-red-700 dark:text-red-400">Zona Bahaya</h2>
        </div>
        <p className="text-xs text-red-600/80 dark:text-red-300">
          Mereset semua data akan mengembalikan database ke data awal (seed Januari 2024). Transaksi baru yang belum dicadangkan akan hilang.
        </p>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Semua Data ke Seed Awal</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Konfirmasi Reset Data"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-xs text-red-800 dark:text-red-200 space-y-2">
            <p className="font-bold text-sm">Apakah Anda yakin ingin mereset data?</p>
            <p>
              Tindakan ini akan mengembalikan seluruh akun, sumber pemasukan, kategori, alokasi anggaran, transaksi, dan aset ke kondisi data awal (seed).
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={isResetting}
              onClick={() => setIsResetModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isResetting}
              onClick={handleResetData}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2"
            >
              {isResetting ? 'Mereset...' : 'Ya, Reset Sekarang'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
