import React, { useState } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { NaturalLanguageInput } from './NaturalLanguageInput';
import { Button } from '../ui/Button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export function AddTransactionModal({ isOpen, onClose, onTransactionAdded, initialType = 'expense' }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState('manual'); // 'manual' or 'smart'
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('household');
  const [sourceOrItem, setSourceOrItem] = useState('');
  const [isIrregular, setIsIrregular] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      await api.createTransaction({
        type,
        amount: Number(amount),
        category,
        source_or_item: sourceOrItem || t(`transactions.categories_${type}.${category}`, category.replace('_', ' ')),
        is_irregular: isIrregular
      });
      setAmount('');
      setSourceOrItem('');
      if (onTransactionAdded) onTransactionAdded();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const incomeCategoryIds = ['farming', 'dairy', 'tailoring', 'salary', 'small_business', 'other'];
  const expenseCategoryIds = ['household', 'food', 'education', 'healthcare', 'agriculture', 'other'];

  const categories = type === 'income'
    ? incomeCategoryIds.map(id => ({ id, label: t(`transactions.categories_income.${id}`, id) }))
    : expenseCategoryIds.map(id => ({ id, label: t(`transactions.categories_expense.${id}`, id) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-card border border-[#E3E7E4] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3E7E4]">
          <h2 className="text-base font-bold text-[#263238]">
            {t('transactions.record_new')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F8F5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-[#F7F8F5] p-1 border border-[#E3E7E4] my-4">
          <button
            type="button"
            onClick={() => setTab('manual')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === 'manual'
                ? 'bg-white text-[#176B5B] shadow-xs'
                : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            {t('transactions.manual_tab')}
          </button>
          <button
            type="button"
            onClick={() => setTab('smart')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              tab === 'smart'
                ? 'bg-white text-[#176B5B] shadow-xs'
                : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            {t('transactions.smart_tab')}
          </button>
        </div>

        {tab === 'smart' ? (
          <NaturalLanguageInput
            onTransactionsSaved={() => {
              if (onTransactionAdded) onTransactionAdded();
              onClose();
            }}
          />
        ) : (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('farming');
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  type === 'income'
                    ? 'bg-[#DDEDE7] border-[#B8D8CE] text-[#176B5B]'
                    : 'bg-white border-[#E3E7E4] text-[#667085]'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{t('transactions.income')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('household');
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  type === 'expense'
                    ? 'bg-[#F2F4F7] border-[#CBD5E1] text-[#263238]'
                    : 'bg-white border-[#E3E7E4] text-[#667085]'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{t('transactions.expense')}</span>
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">
                {t('transactions.amount')}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder={t('transactions.amount_placeholder')}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-sm text-[#263238] focus:border-[#176B5B] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">
                {t('transactions.category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-sm text-[#263238] focus:border-[#176B5B] focus:outline-none bg-white cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#263238] mb-1">
                {t('transactions.description')}
              </label>
              <input
                type="text"
                placeholder={t('transactions.description_placeholder')}
                value={sourceOrItem}
                onChange={(e) => setSourceOrItem(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E3E7E4] text-sm text-[#263238] focus:border-[#176B5B] focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting || !amount}
              >
                {submitting ? t('transactions.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
