import React, { useState, useRef } from 'react';
import { Check, Edit2, Trash2 } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onToggleCheck: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  category,
  onToggleCheck,
  onEdit,
  onDelete,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 0 && diff <= 120) {
      setSwipeOffset(diff);
    } else if (diff < 0 && isOpen) {
      setSwipeOffset(Math.max(0, 100 + diff));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 50) {
      setSwipeOffset(100);
      setIsOpen(true);
    } else {
      setSwipeOffset(0);
      setIsOpen(false);
    }
    setTouchStart(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5">
      {/* Background action buttons for swipe */}
      <div className="absolute inset-y-0 right-0 w-[100px] flex items-center justify-end px-2 gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => onEdit(transaction)}
          className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-300 transition-colors"
          title="Ubah"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(transaction)}
          className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          title="Hapus"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
          transition: touchStart === null ? 'transform 0.2s ease-out' : 'none',
        }}
        className={`relative z-10 flex items-center justify-between p-3.5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-soft rounded-2xl select-none ${
          transaction.isChecked ? 'bg-slate-50/80 dark:bg-slate-800/50' : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => onToggleCheck(transaction.id)}
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
              transaction.isChecked
                ? 'bg-primary-brand border-primary-brand text-white'
                : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-primary-brand'
            }`}
            aria-label="Tandai transaksi"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Description & Category */}
          <div className="min-w-0">
            <p
              className={`text-sm font-semibold truncate ${
                transaction.isChecked
                  ? 'text-slate-400 dark:text-slate-500 line-through'
                  : 'text-slate-800 dark:text-slate-100'
              }`}
            >
              {transaction.description || category?.name || 'Pengeluaran'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {category?.name || 'Tanpa Kategori'}
            </p>
          </div>
        </div>

        {/* Amount & Desktop Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-sm font-bold ${
              transaction.isChecked
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-white'
            }`}
          >
            {formatRupiah(transaction.amount)}
          </span>

          {/* Small action trigger for mouse users */}
          <div className="hidden sm:flex items-center gap-1 ml-1 opacity-60 hover:opacity-100">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1 hover:text-primary-brand text-slate-400 transition-colors"
              title="Ubah"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(transaction)}
              className="p-1 hover:text-red-500 text-slate-400 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
