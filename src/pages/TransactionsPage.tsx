import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, AlertTriangle, ReceiptText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/common/MonthSelector';
import { TransactionItem } from '../components/transactions/TransactionItem';
import { Modal } from '../components/ui/Modal';
import { transactionRepository } from '../db/repositories/transactionRepository';
import { categoryRepository } from '../db/repositories/categoryRepository';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import type { Transaction, Category } from '../types';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeYear, activeMonth } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [deleteCandidate, setDeleteCandidate] = useState<Transaction | null>(null);

  const loadData = useCallback(async () => {
    const [trxList, catList] = await Promise.all([
      transactionRepository.getByMonth(activeYear, activeMonth),
      categoryRepository.getAll(),
    ]);
    setTransactions(trxList);
    setCategories(catList);
  }, [activeYear, activeMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryMap = useMemo(() => {
    return new Map<string, Category>(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Active categories that have transactions or are active
  const filterCategories = useMemo(() => {
    return categories.filter((c) => c.isActive);
  }, [categories]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Category filter
      if (selectedCategoryId !== 'all' && t.categoryId !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const catName = (categoryMap.get(t.categoryId)?.name || '').toLowerCase();
        return desc.includes(query) || catName.includes(query);
      }
      return true;
    });
  }, [transactions, selectedCategoryId, searchQuery, categoryMap]);

  // Total for this month (from filtered or all)
  const totalSpendingMonth = useMemo(() => {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { date: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    for (const trx of filteredTransactions) {
      if (!map.has(trx.date)) {
        map.set(trx.date, []);
      }
      map.get(trx.date)!.push(trx);
    }

    // Sort dates descending
    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    for (const date of sortedDates) {
      groups.push({
        date,
        items: map.get(date)!,
      });
    }

    return groups;
  }, [filteredTransactions]);

  // Checkbox toggle
  const handleToggleCheck = async (id: string) => {
    const newState = await transactionRepository.toggleChecked(id);
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isChecked: newState } : t))
    );
  };

  // Edit action
  const handleEdit = (trx: Transaction) => {
    navigate(`/transaksi/ubah/${trx.id}`);
  };

  // Delete action
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    await transactionRepository.delete(deleteCandidate.id);
    setDeleteCandidate(null);
    await loadData();
  };

  return (
    <div className="p-4 space-y-4 relative pb-28">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Transaksi</h1>
        <MonthSelector />
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white shadow-soft"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedCategoryId('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
            selectedCategoryId === 'all'
              ? 'bg-primary-brand text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
          }`}
        >
          Semua
        </button>

        {filterCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategoryId === cat.id
                ? 'bg-primary-brand text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Total Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-soft flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total bulan ini</span>
        <span className="text-lg font-extrabold text-slate-800 dark:text-white">
          {formatRupiah(totalSpendingMonth)}
        </span>
      </div>

      {/* Transactions Grouped By Date */}
      {groupedTransactions.map((group) => (
        <div key={group.date} className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1 pt-1">
            {formatDateIndo(group.date)}
          </h2>
          <div>
            {group.items.map((trx) => (
              <TransactionItem
                key={trx.id}
                transaction={trx}
                category={categoryMap.get(trx.categoryId)}
                onToggleCheck={handleToggleCheck}
                onEdit={handleEdit}
                onDelete={(t) => setDeleteCandidate(t)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {groupedTransactions.length === 0 && (
        <div className="text-center py-12 px-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ReceiptText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Belum ada transaksi</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {searchQuery || selectedCategoryId !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter atau kata kunci pencarian.'
              : 'Catat pengeluaran pertama Anda bulan ini dengan menekan tombol tambah (+).'}
          </p>
        </div>
      )}

      {/* Bottom Hint */}
      {groupedTransactions.length > 0 && (
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-1 pb-4">
          Geser ke kiri: ubah / hapus
        </p>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => navigate('/transaksi/tambah')}
        className="fixed bottom-20 right-6 sm:right-[calc(50%-180px)] z-30 w-14 h-14 rounded-full bg-primary-brand hover:bg-primary-brandDark text-white flex items-center justify-center shadow-float hover:scale-105 active:scale-95 transition-all duration-150"
        aria-label="Tambah Transaksi"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteCandidate !== null}
        onClose={() => setDeleteCandidate(null)}
        title="Hapus Transaksi"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <p className="font-semibold">Apakah Anda yakin ingin menghapus transaksi ini?</p>
              <p className="mt-1">
                "{deleteCandidate?.description || 'Transaksi'}" sebesar{' '}
                <strong>{formatRupiah(deleteCandidate?.amount || 0)}</strong>
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
              onClick={handleDeleteConfirm}
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
