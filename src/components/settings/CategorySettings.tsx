import React, { useState, useEffect } from 'react';
import { Tag, Plus, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Category, CategoryType, Account } from '../../types';
import { categoryRepository } from '../../db/repositories/categoryRepository';
import { accountRepository } from '../../db/repositories/accountRepository';
import { Modal } from '../ui/Modal';

export const CategorySettings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | CategoryType>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('needs');
  const [accountId, setAccountId] = useState<string>('');

  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadData = async () => {
    const [cats, accs] = await Promise.all([
      categoryRepository.getAll(),
      accountRepository.getActive(),
    ]);
    setCategories(cats);
    setAccounts(accs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setType(activeTab === 'all' ? 'needs' : activeTab);
    setAccountId(accounts.length > 0 ? accounts[0].id : '');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setAccountId(cat.accountId || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      await categoryRepository.update(editingCategory.id, {
        name: name.trim(),
        type,
        accountId: accountId || undefined,
      });
    } else {
      await categoryRepository.create({
        name: name.trim(),
        type,
        accountId: accountId || undefined,
        isActive: true,
        sortOrder: categories.length + 1,
      });
    }

    setIsModalOpen(false);
    await loadData();
  };

  const toggleCategoryActive = async (cat: Category) => {
    await categoryRepository.update(cat.id, { isActive: !cat.isActive });
    await loadData();
  };

  const handleDeleteOrDeactivate = async (cat: Category) => {
    const result = await categoryRepository.deleteOrDeactivate(cat.id);
    setDeleteConfirmCategory(null);
    if (result.deactivated) {
      setInfoMessage(`Kategori "${cat.name}" memiliki riwayat transaksi/alokasi sehingga dinonaktifkan agar data tetap konsisten.`);
    } else {
      setInfoMessage(`Kategori "${cat.name}" berhasil dihapus.`);
    }
    setTimeout(() => setInfoMessage(null), 4000);
    await loadData();
  };

  const filteredCategories = categories.filter((c) => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const getAccountName = (accId?: string) => {
    if (!accId) return 'Tanpa rekening';
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Rekening arsip';
  };

  const getTypeBadge = (catType: CategoryType) => {
    switch (catType) {
      case 'needs':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Needs</span>;
      case 'wants':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Wants</span>;
      case 'savings':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Savings</span>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary-brand dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Kategori Anggaran</h2>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-emerald-950/40 text-primary-brand dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {infoMessage && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs font-medium">
        {(['all', 'needs', 'wants', 'savings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-lg transition-all capitalize ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-primary-brand dark:text-emerald-400 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'all' ? 'Semua' : tab}
          </button>
        ))}
      </div>

      {/* Categories List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60 max-h-[360px] overflow-y-auto pr-1">
        {filteredCategories.map((cat) => (
          <div key={cat.id} className="py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleCategoryActive(cat)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  cat.isActive
                    ? 'bg-primary-brand border-primary-brand text-white'
                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                }`}
                title={cat.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${cat.isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>
                    {cat.name}
                  </p>
                  {getTypeBadge(cat.type)}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Rekening: <span className="font-medium text-slate-600 dark:text-slate-300">{getAccountName(cat.accountId)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Ubah kategori"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirmCategory(cat)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="Hapus / nonaktifkan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <p className="text-center py-6 text-xs text-slate-400">Tidak ada kategori di kelompok ini.</p>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Ubah Kategori' : 'Tambah Kategori'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Makan Siang, Skincare, Donasi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Kelompok Tipe
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['needs', 'wants', 'savings'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border capitalize transition-all ${
                    type === t
                      ? 'bg-primary-brand text-white border-primary-brand shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Rekening Tujuan Default
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            >
              <option value="">-- Pilih Rekening Default --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan untuk kalkulasi "Transfer per rekening bulan ini" pada Dashboard.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-brand hover:bg-primary-brandDark text-white text-sm font-semibold shadow-soft"
            >
              {editingCategory ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Modal */}
      <Modal
        isOpen={deleteConfirmCategory !== null}
        onClose={() => setDeleteConfirmCategory(null)}
        title="Hapus / Nonaktifkan Kategori"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Konfirmasi tindakan kategori:</p>
              <p className="mt-1">
                Jika kategori "{deleteConfirmCategory?.name}" sudah memiliki riwayat alokasi atau transaksi, kategori akan dinonaktifkan otomatis agar histori pengeluaran Anda tetap akurat.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmCategory(null)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => deleteConfirmCategory && handleDeleteOrDeactivate(deleteConfirmCategory)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
