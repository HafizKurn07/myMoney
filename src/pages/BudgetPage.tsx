import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from '../components/common/MonthSelector';
import { MoneyInput } from '../components/ui/MoneyInput';
import { Modal } from '../components/ui/Modal';
import { monthlyIncomeRepository } from '../db/repositories/monthlyIncomeRepository';
import { allocationRepository } from '../db/repositories/allocationRepository';
import { categoryRepository } from '../db/repositories/categoryRepository';
import { incomeSourceRepository } from '../db/repositories/incomeSourceRepository';
import { accountRepository } from '../db/repositories/accountRepository';
import { transactionRepository } from '../db/repositories/transactionRepository';
import { calculateBudgetSummary } from '../utils/calculations';
import { formatRupiah } from '../utils/formatters';
import type {
  Category,
  IncomeSource,
  Account,
  MonthlyIncome,
  Allocation,
  CategoryType,
} from '../types';

export const BudgetPage: React.FC = () => {
  const { activeYear, activeMonth } = useApp();

  const [incomes, setIncomes] = useState<MonthlyIncome[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Expanded state for long category lists
  const [expandedNeeds, setExpandedNeeds] = useState(false);
  const [expandedWants, setExpandedWants] = useState(false);
  const [expandedSavings, setExpandedSavings] = useState(false);

  // Add Income Source Modal
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceAmount, setNewSourceAmount] = useState<number>(0);

  // Confirmation Modal for copying
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    const [incList, srcList, catList, accList, allocList, trxList] = await Promise.all([
      monthlyIncomeRepository.getByMonth(activeYear, activeMonth),
      incomeSourceRepository.getActive(),
      categoryRepository.getActive(),
      accountRepository.getActive(),
      allocationRepository.getByMonth(activeYear, activeMonth),
      transactionRepository.getByMonth(activeYear, activeMonth),
    ]);

    setIncomes(incList);
    setIncomeSources(srcList);
    setCategories(catList);
    setAccounts(accList);
    setAllocations(allocList);
    setTransactions(trxList);
  }, [activeYear, activeMonth]);

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Map helpers
  const incomeAmountMap = new Map<string, number>(incomes.map((i) => [i.incomeSourceId, i.amount]));
  const allocAmountMap = new Map<string, number>(allocations.map((a) => [a.categoryId, a.amount]));
  const accountMap = new Map<string, Account>(accounts.map((a) => [a.id, a]));

  // Financial summary
  const summary = calculateBudgetSummary(incomes, allocations, categories, transactions);

  // Update Income Amount
  const handleIncomeChange = async (incomeSourceId: string, amount: number) => {
    await monthlyIncomeRepository.setAmount(activeYear, activeMonth, incomeSourceId, amount);
    // Optimistic local state update
    setIncomes((prev) => {
      const idx = prev.findIndex((i) => i.incomeSourceId === incomeSourceId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            year: activeYear,
            month: activeMonth,
            incomeSourceId,
            amount,
          },
        ];
      }
    });
  };

  // Update Allocation Amount
  const handleAllocationChange = async (categoryId: string, amount: number) => {
    await allocationRepository.setAmount(activeYear, activeMonth, categoryId, amount);
    // Optimistic local state update
    setAllocations((prev) => {
      const idx = prev.findIndex((a) => a.categoryId === categoryId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], amount };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            year: activeYear,
            month: activeMonth,
            categoryId,
            amount,
          },
        ];
      }
    });
  };

  // Handle Add New Income Source
  const handleAddNewIncomeSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    const createdSource = await incomeSourceRepository.create({
      name: newSourceName.trim(),
      isActive: true,
      sortOrder: incomeSources.length + 1,
    });

    if (newSourceAmount > 0) {
      await monthlyIncomeRepository.setAmount(activeYear, activeMonth, createdSource.id, newSourceAmount);
    }

    setNewSourceName('');
    setNewSourceAmount(0);
    setIsAddSourceModalOpen(false);
    await loadData();
    showToast(`Sumber income "${createdSource.name}" ditambahkan!`);
  };

  // Handle Copy From Previous Month
  const handleConfirmCopy = async () => {
    const copiedIncomes = await monthlyIncomeRepository.copyFromPreviousMonth(activeYear, activeMonth);
    const copiedAllocations = await allocationRepository.copyFromPreviousMonth(activeYear, activeMonth);

    setIsCopyModalOpen(false);
    await loadData();

    if (copiedIncomes === 0 && copiedAllocations === 0) {
      showToast('Tidak ada data di bulan sebelumnya untuk disalin.');
    } else {
      showToast(`Berhasil menyalin data dari bulan sebelumnya!`);
    }
  };

  // Render a Category Group Card (Needs, Wants, Savings)
  const renderCategoryGroupCard = (
    type: CategoryType,
    title: string,
    subtotal: number,
    percent: number,
    isExpanded: boolean,
    toggleExpanded: () => void
  ) => {
    const groupCategories = categories.filter((c) => c.type === type);
    const displayedCategories = isExpanded ? groupCategories : groupCategories.slice(0, 4);
    const hasMore = groupCategories.length > 4;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
          <h2 className="text-base font-bold text-slate-800 dark:text-white capitalize">{title}</h2>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {subtotal.toLocaleString('id-ID')} · {percent.toFixed(1).replace('.', ',')}%
          </span>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {displayedCategories.map((cat) => {
            const acc = cat.accountId ? accountMap.get(cat.accountId) : undefined;
            const amount = allocAmountMap.get(cat.id) || 0;

            return (
              <div key={cat.id} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {cat.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {acc ? acc.name : 'Rekening default'}
                  </p>
                </div>
                <div className="w-36">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 focus-within:border-primary-brand focus-within:ring-2 focus-within:ring-primary-brand/20 transition-all">
                    <MoneyInput
                      value={amount}
                      onChange={(val) => handleAllocationChange(cat.id, val)}
                      placeholder="0"
                      className="w-full text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {groupCategories.length === 0 && (
            <p className="text-xs text-slate-400 py-2 text-center">Belum ada kategori di kelompok ini.</p>
          )}

          {hasMore && (
            <button
              onClick={toggleExpanded}
              className="w-full pt-1 flex items-center justify-center gap-1 text-xs font-semibold text-primary-brand dark:text-emerald-400 hover:underline"
            >
              {isExpanded ? (
                <>
                  <span>Tampilkan lebih sedikit</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>+ {groupCategories.length - 4} kategori lagi</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-4 py-2 rounded-full text-xs font-semibold shadow-float flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">Budget</h1>
        <MonthSelector />
      </div>

      {/* 1. Kartu Income */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Income</h2>

        <div className="space-y-3">
          {incomeSources.map((source) => {
            const amount = incomeAmountMap.get(source.id) || 0;
            return (
              <div key={source.id} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 truncate">
                  {source.name}
                </span>
                <div className="w-36">
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-900 focus-within:border-primary-brand focus-within:ring-2 focus-within:ring-primary-brand/20 transition-all">
                    <MoneyInput
                      value={amount}
                      onChange={(val) => handleIncomeChange(source.id, val)}
                      placeholder="0"
                      className="w-full text-xs text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {incomeSources.length === 0 && (
            <p className="text-xs text-slate-400 py-2 text-center">Belum ada sumber pemasukan.</p>
          )}

          <button
            onClick={() => setIsAddSourceModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-primary-brand/40 dark:border-emerald-600/40 text-primary-brand dark:text-emerald-400 text-xs font-bold hover:bg-primary-50 dark:hover:bg-emerald-950/30 flex items-center justify-center gap-1.5 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Sumber income</span>
          </button>
        </div>
      </div>

      {/* 2. Kartu Ringkasan */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Total income</span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {formatRupiah(summary.totalIncome)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Dialokasikan ({summary.allocatedPercent.toFixed(1).replace('.', ',')}%)
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-white">
            {formatRupiah(summary.budgetedExpenses + summary.monthlySavings)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Belum dialokasikan</span>
          <span
            className={`text-sm font-extrabold ${
              summary.nonAllocated < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-primary-brand dark:text-emerald-400'
            }`}
          >
            {formatRupiah(summary.nonAllocated)}
          </span>
        </div>
      </div>

      {/* 3. Tombol Salin dari bulan lalu */}
      <button
        onClick={() => setIsCopyModalOpen(true)}
        className="w-full py-3 rounded-2xl border border-primary-brand/40 dark:border-emerald-600/50 bg-white dark:bg-slate-800 text-primary-brand dark:text-emerald-400 text-sm font-bold hover:bg-primary-50/50 dark:hover:bg-slate-700/50 flex items-center justify-center gap-2 shadow-soft transition-all active:scale-[0.99]"
      >
        <Copy className="w-4 h-4" />
        <span>Salin dari bulan lalu</span>
      </button>

      {/* 4. Kartu Needs */}
      {renderCategoryGroupCard(
        'needs',
        'Needs',
        summary.needsSubtotal,
        summary.needsPercent,
        expandedNeeds,
        () => setExpandedNeeds((prev) => !prev)
      )}

      {/* 5. Kartu Wants */}
      {renderCategoryGroupCard(
        'wants',
        'Wants',
        summary.wantsSubtotal,
        summary.wantsPercent,
        expandedWants,
        () => setExpandedWants((prev) => !prev)
      )}

      {/* 6. Kartu Savings */}
      {renderCategoryGroupCard(
        'savings',
        'Savings',
        summary.savingsSubtotal,
        summary.savingsPercent,
        expandedSavings,
        () => setExpandedSavings((prev) => !prev)
      )}

      {/* Modal Tambah Sumber Income */}
      <Modal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
        title="Tambah Sumber Income"
      >
        <form onSubmit={handleAddNewIncomeSource} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Sumber Pemasukan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bonus Tahunan, Dividen"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nominal Bulan Ini (Opsional)
            </label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-brand/30 dark:focus-within:ring-emerald-500/30">
              <MoneyInput
                value={newSourceAmount}
                onChange={setNewSourceAmount}
                placeholder="0"
                className="w-full text-sm font-semibold text-slate-800 dark:text-white text-left"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddSourceModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-brand hover:bg-primary-brandDark text-white text-sm font-semibold shadow-soft"
            >
              Tambah Sumber
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Salin Bulan Lalu */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Salin Anggaran Bulan Lalu"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Aksi ini akan menyalin seluruh pemasukan dan alokasi kategori dari bulan sebelumnya ke bulan terpilih. Nilai alokasi kategori yang sudah Anda isi untuk bulan ini akan diperbarui sesuai bulan sebelumnya.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCopyModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmCopy}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-brand hover:bg-primary-brandDark text-white text-sm font-bold shadow-soft"
            >
              Ya, Salin Sekarang
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
