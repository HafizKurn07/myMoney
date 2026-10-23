import React, { useState, useEffect } from 'react';
import { Calendar, Target, Check, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { settingsRepository } from '../../db/repositories/settingsRepository';
import { formatNumberWithDots, parseNumberFromDots, formatRupiah } from '../../utils/formatters';

export const GeneralSettings: React.FC = () => {
  const { settings, refreshSettings } = useApp();
  const [paydayDay, setPaydayDay] = useState<number>(25);
  const [targetAsetString, setTargetAsetString] = useState<string>('1.500.000.000');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setPaydayDay(settings.paydayDay || 25);
      setTargetAsetString(formatNumberWithDots(settings.assetTarget || 1500000000));
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paydayDay < 1 || paydayDay > 31) {
      setError('Tanggal gajian harus antara 1 dan 31');
      return;
    }

    const numericTarget = parseNumberFromDots(targetAsetString);
    if (numericTarget < 0) {
      setError('Target aset tidak boleh negatif');
      return;
    }

    await settingsRepository.updateSettings({
      paydayDay,
      assetTarget: numericTarget,
    });

    await refreshSettings();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary-brand dark:text-emerald-400" />
        <h2 className="text-base font-bold text-slate-800 dark:text-white">Target Aset & Gajian</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Tanggal Gajian Bulanan (1 - 31)
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="31"
              value={paydayDay}
              onChange={(e) => setPaydayDay(parseInt(e.target.value, 10) || 1)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Digunakan untuk banner countdown hari gajian di Dashboard.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Target Akumulasi Aset (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={targetAsetString}
              onChange={(e) => setTargetAsetString(formatNumberWithDots(e.target.value))}
              placeholder="0"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-brand/30 dark:focus:ring-emerald-500/30 text-slate-800 dark:text-white"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Target: <span className="font-semibold text-slate-700 dark:text-slate-200">{formatRupiah(parseNumberFromDots(targetAsetString))}</span>
          </p>
        </div>

        <button
          type="submit"
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 ${
            isSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-primary-brand hover:bg-primary-brandDark text-white shadow-soft active:scale-[0.98]'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Tersimpan!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
