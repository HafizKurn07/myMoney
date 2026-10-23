import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Calendar, Tag, Check, Sparkles } from 'lucide-react';
import { categoryRepository } from '../db/repositories/categoryRepository';
import { transactionRepository } from '../db/repositories/transactionRepository';
import { formatNumberWithDots, parseNumberFromDots, formatRupiah } from '../utils/formatters';
import type { Category } from '../types';

export const AddTransactionPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const activeCats = await categoryRepository.getActive();
      setCategories(activeCats);

      if (isEditMode && id) {
        const existing = await transactionRepository.getById(id);
        if (existing) {
          setAmount(existing.amount);
          setSelectedCategoryId(existing.categoryId);
          setDate(existing.date);
          setDescription(existing.description || '');
        }
      } else if (activeCats.length > 0) {
        // Default select first category (e.g. Food) for super fast 1-tap entry
        setSelectedCategoryId(activeCats[0].id);
      }
      setIsLoading(false);

      // Auto-focus amount input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    init();
  }, [id, isEditMode]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumberFromDots(e.target.value);
    setAmount(parsed);
  };

  const handleAddPreset = (addValue: number) => {
    setAmount((prev) => prev + addValue);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Nominal harus lebih dari 0');
      inputRef.current?.focus();
      return;
    }

    if (!selectedCategoryId) {
      setError('Pilih salah satu kategori');
      return;
    }

    if (isEditMode && id) {
      await transactionRepository.update(id, {
        amount,
        categoryId: selectedCategoryId,
        date,
        description: description.trim() || undefined,
      });
    } else {
      await transactionRepository.create({
        amount,
        categoryId: selectedCategoryId,
        date,
        description: description.trim() || undefined,
        isChecked: false,
      });
    }

    navigate('/transaksi', { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] dark:bg-slate-900">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      {/* Centered mobile wrapper */}
      <div className="max-w-[430px] w-full mx-auto min-h-screen flex flex-col justify-between p-4 bg-[#F8FAF9] dark:bg-slate-900">
        
        {/* Top Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700/80 flex items-center justify-center bg-white dark:bg-slate-800 shadow-soft text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
              aria-label="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight">
              {isEditMode ? 'Ubah transaksi' : 'Tambah transaksi'}
            </h1>
          </div>

          {error && (
            <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-xl animate-fade-in">
              {error}
            </div>
          )}

          {/* Big Amount Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-soft text-center relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 block mb-2">Nominal</span>
            <div className="flex items-center justify-center min-h-[56px]">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {amount === 0 ? 'Rp 0' : formatRupiah(amount)}
              </span>
            </div>

            {/* Hidden native input overlay for mobile keyboard */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={amount === 0 ? '' : formatNumberWithDots(amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Nominal transaksi"
            />

            {/* Quick Presets */}
            <div className="flex justify-center gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 relative z-10">
              {[10000, 20000, 50000, 100000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAddPreset(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors"
                >
                  +{val / 1000}rb
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary-brand dark:text-emerald-400" />
                <span>Kategori</span>
              </label>
              <span className="text-[11px] text-slate-400">Pilih salah satu</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-primary-brand text-white shadow-soft scale-105'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Tanggal</span>
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 text-right focus:outline-none cursor-pointer"
            />
          </div>

          {/* Description Input */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-soft">
            <input
              type="text"
              placeholder="Deskripsi (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="pt-6 pb-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={amount <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide shadow-float flex items-center justify-center gap-2 transition-all duration-150 ${
              amount > 0
                ? 'bg-primary-brand hover:bg-primary-brandDark text-white active:scale-[0.98]'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
