import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { MoneyInput } from '../ui/MoneyInput';
import type { Asset, LiquidityType, AssetType, Account } from '../../types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<Asset, 'id'> & { id?: string }) => Promise<void>;
  editingAsset: Asset | null;
  accounts: Account[];
  initialLiquidity?: LiquidityType;
}

const ASSET_TYPES: AssetType[] = [
  'Tabungan',
  'Saham',
  'Obligasi',
  'Reksa Dana',
  'Deposito',
  'BPJS',
  'Lainnya',
];

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  accounts,
  initialLiquidity = 'liquid',
}) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState<number>(0);
  const [liquidity, setLiquidity] = useState<LiquidityType>(initialLiquidity);
  const [assetType, setAssetType] = useState<AssetType>('Tabungan');
  const [accountId, setAccountId] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingAsset) {
      setName(editingAsset.name);
      setValue(editingAsset.value);
      setLiquidity(editingAsset.liquidity);
      setAssetType((editingAsset.assetType as AssetType) || 'Tabungan');
      setAccountId(editingAsset.accountId || '');
      setUpdatedAt(editingAsset.updatedAt || new Date().toISOString().split('T')[0]);
    } else {
      setName('');
      setValue(0);
      setLiquidity(initialLiquidity);
      setAssetType(initialLiquidity === 'liquid' ? 'Tabungan' : 'Saham');
      setAccountId(accounts.length > 0 ? accounts[0].id : '');
      setUpdatedAt(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [editingAsset, initialLiquidity, isOpen, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama aset wajib diisi');
      return;
    }
    if (value < 0) {
      setError('Nilai aset tidak boleh negatif');
      return;
    }

    await onSave({
      id: editingAsset ? editingAsset.id : undefined,
      name: name.trim(),
      value,
      liquidity,
      assetType,
      accountId: accountId || undefined,
      updatedAt,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingAsset ? 'Ubah Rincian Aset' : 'Tambah Aset'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nama Aset
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Tabungan Utama, Portofolio Saham, Dana Darurat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Nilai / Saldo Aset (Rp)
          </label>
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 bg-slate-50 dark:bg-slate-900 focus-within:ring-2 focus-within:ring-primary-brand/30 dark:focus-within:ring-emerald-500/30">
            <MoneyInput
              value={value}
              onChange={setValue}
              placeholder="0"
              className="w-full text-sm font-bold text-slate-900 dark:text-white text-left"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Likuiditas
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setLiquidity('liquid')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  liquidity === 'liquid'
                    ? 'bg-white dark:bg-slate-800 text-primary-brand dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Liquid
              </button>
              <button
                type="button"
                onClick={() => setLiquidity('non_liquid')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  liquidity === 'non_liquid'
                    ? 'bg-white dark:bg-slate-800 text-primary-brand dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Non-Liquid
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Jenis Aset
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            >
              {ASSET_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Akun Terkait (Opsional)
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            >
              <option value="">-- Tanpa Akun --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Tanggal Pembaruan
            </label>
            <input
              type="date"
              value={updatedAt}
              onChange={(e) => setUpdatedAt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-xl bg-primary-brand hover:bg-primary-brandDark text-white text-sm font-bold shadow-soft"
          >
            {editingAsset ? 'Simpan' : 'Tambah Aset'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
