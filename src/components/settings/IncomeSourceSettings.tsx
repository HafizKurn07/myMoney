import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { IncomeSource } from '../../types';
import { incomeSourceRepository } from '../../db/repositories/incomeSourceRepository';
import { Modal } from '../ui/Modal';

export const IncomeSourceSettings: React.FC = () => {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [sourceName, setSourceName] = useState('');
  const [deleteConfirmSource, setDeleteConfirmSource] = useState<IncomeSource | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadSources = async () => {
    const list = await incomeSourceRepository.getAll();
    setSources(list);
  };

  useEffect(() => {
    loadSources();
  }, []);

  const openCreateModal = () => {
    setEditingSource(null);
    setSourceName('');
    setIsModalOpen(true);
  };

  const openEditModal = (src: IncomeSource) => {
    setEditingSource(src);
    setSourceName(src.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceName.trim()) return;

    if (editingSource) {
      await incomeSourceRepository.update(editingSource.id, { name: sourceName.trim() });
    } else {
      await incomeSourceRepository.create({
        name: sourceName.trim(),
        isActive: true,
        sortOrder: sources.length + 1,
      });
    }

    setIsModalOpen(false);
    await loadSources();
  };

  const toggleSourceActive = async (src: IncomeSource) => {
    await incomeSourceRepository.update(src.id, { isActive: !src.isActive });
    await loadSources();
  };

  const handleDeleteOrDeactivate = async (src: IncomeSource) => {
    const result = await incomeSourceRepository.deleteOrDeactivate(src.id);
    setDeleteConfirmSource(null);
    if (result.deactivated) {
      setInfoMessage(`Sumber pemasukan "${src.name}" telah memiliki riwayat nominal bulanan, sehingga dinonaktifkan.`);
    } else {
      setInfoMessage(`Sumber pemasukan "${src.name}" berhasil dihapus.`);
    }
    setTimeout(() => setInfoMessage(null), 4000);
    await loadSources();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary-brand dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Sumber Pemasukan (Income)</h2>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-emerald-950/40 text-primary-brand dark:text-emerald-400 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Sumber</span>
        </button>
      </div>

      {infoMessage && (
        <div className="p-3 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {sources.map((src) => (
          <div key={src.id} className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleSourceActive(src)}
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  src.isActive
                    ? 'bg-primary-brand border-primary-brand text-white'
                    : 'border-slate-300 dark:border-slate-600 text-transparent'
                }`}
                title={src.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </button>
              <div>
                <p className={`text-sm font-semibold ${src.isActive ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>
                  {src.name}
                </p>
                <span className="text-[11px] text-slate-400">
                  {src.isActive ? 'Aktif' : 'Non-aktif (Arsip)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(src)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Ubah nama"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteConfirmSource(src)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                title="Hapus atau nonaktifkan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <p className="text-center py-4 text-xs text-slate-400">Belum ada sumber pemasukan.</p>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSource ? 'Ubah Sumber Pemasukan' : 'Tambah Sumber Pemasukan'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Nama Sumber Pemasukan
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gaji Pokok, Tunjangan, Side Project"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
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
              {editingSource ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmSource !== null}
        onClose={() => setDeleteConfirmSource(null)}
        title="Hapus / Nonaktifkan Sumber"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-semibold">Konfirmasi tindakan:</p>
              <p className="mt-1">
                Jika sumber "{deleteConfirmSource?.name}" sudah memiliki riwayat pencatatan, sumber akan dinonaktifkan agar riwayat tetap tersimpan rapi.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmSource(null)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => deleteConfirmSource && handleDeleteOrDeactivate(deleteConfirmSource)}
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
