import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Account } from '../../types';
import { accountRepository } from '../../db/repositories/accountRepository';
import { Modal } from '../ui/Modal';

export const AccountSettings: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountName, setAccountName] = useState('');
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState<Account | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadAccounts = async () => {
    const list = await accountRepository.getAll();
    setAccounts(list);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const openCreateModal = () => {
    setEditingAccount(null);
    setAccountName('');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setAccountName(acc.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    if (editingAccount) {
      await accountRepository.update(editingAccount.id, { name: accountName.trim() });
    } else {
      await accountRepository.create({
        name: accountName.trim(),
        isActive: true,
        sortOrder: accounts.length + 1,
      });
    }

    setIsModalOpen(false);
    await loadAccounts();
  };

  const toggleAccountActive = async (acc: Account) => {
    await accountRepository.update(acc.id, { isActive: !acc.isActive });
    await loadAccounts();
  };

  const handleDeleteOrDeactivate = async (acc: Account) => {
    const result = await accountRepository.deleteOrDeactivate(acc.id);
    setDeleteConfirmAccount(null);
    if (result.deactivated) {
      setInfoMessage(`Akun "${acc.name}" telah digunakan pada riwayat, sehingga dinonaktifkan (arsip) agar histori tetap aman.`);
    } else {
      setInfoMessage(`Akun "${acc.name}" berhasil dihapus.`);
    }
    setTimeout(() => setInfoMessage(null), 4000);
    await loadAccounts();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-primary-brand dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Akun Rekening Bank</h2>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-emerald-950/40 text-primary-brand dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Akun</span>
        </button>
      </div>

      {infoMessage && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {accounts.map((acc) => (
          <div key={acc.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleAccountActive(acc)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  acc.isActive
                    ? 'bg-primary-brand border-primary-brand text-white'
                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                }`}
                title={acc.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <div>
                <p className={`text-sm font-semibold ${acc.isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>
                  {acc.name}
                </p>
                <span className="text-[11px] text-slate-400">
                  {acc.isActive ? 'Aktif' : 'Non-aktif (Arsip)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(acc)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Ubah nama akun"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirmAccount(acc)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="Hapus atau nonaktifkan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <p className="text-center py-4 text-xs text-slate-400">Belum ada akun rekening.</p>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAccount ? 'Ubah Nama Akun' : 'Tambah Akun Bank'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Akun / Bank / E-Wallet
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: BCA, Jago, Bibit, Mandiri"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
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
              {editingAccount ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete / Deactivate Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmAccount !== null}
        onClose={() => setDeleteConfirmAccount(null)}
        title="Hapus / Nonaktifkan Akun"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Konfirmasi tindakan akun:</p>
              <p className="mt-1">
                Jika akun "{deleteConfirmAccount?.name}" sudah memiliki riwayat transaksi atau kategori tertaut, akun akan <strong>dinonaktifkan otomatis</strong> agar riwayat keuangan Anda tetap utuh.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmAccount(null)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => deleteConfirmAccount && handleDeleteOrDeactivate(deleteConfirmAccount)}
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
