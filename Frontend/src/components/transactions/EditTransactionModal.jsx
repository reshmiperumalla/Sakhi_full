import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/Button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export function EditTransactionModal({ isOpen, transaction, onClose, onTransactionUpdated }) {
  const { t } = useLanguage();
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('household');
  const [sourceOrItem, setSourceOrItem] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setAmount(transaction.amount || '');
      setCategory(transaction.category || 'household');
      setSourceOrItem(transaction.source_or_item || '');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      const txId = transaction.id || transaction._id;
      await api.updateTransaction(txId, {
        type,
        amount: Number(amount),
        category,
        source_or_item: sourceOrItem || t(`transactions.categories_${type}.${category}`, category.replace('_', ' '))
      });
      api.dispatchFinancialMutation();
      if (onTransactionUpdated) onTransactionUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update transaction:', err);
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
            {t('transactions.edit_title', 'Edit Transaction')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#263238] hover:bg-[#F7F8F5] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategory('household'); }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#FEF2F2] border-[#C54B4B] text-[#C54B4B]'
                  : 'bg-white border-[#E3E7E4] text-[#667085]'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              {t('transactions.type_expense')}
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategory('farming'); }}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                type === 'income'
                  ? 'bg-[#E6F4EA] border-[#137333] text-[#137333]'
                  : 'bg-white border-[#E3E7E4] text-[#667085]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              {t('transactions.type_income')}
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-[#475467] mb-1">
              {t('transactions.amount_label')} (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#263238]">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl pl-8 pr-4 py-2.5 text-base font-bold text-[#263238] focus:bg-white focus:outline-none focus:border-[#176B5B]"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-[#475467] mb-1">
              {t('transactions.category_label')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#263238] focus:bg-white focus:outline-none focus:border-[#176B5B]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-[#475467] mb-1">
              {t('transactions.source_item_label')}
            </label>
            <input
              type="text"
              value={sourceOrItem}
              onChange={(e) => setSourceOrItem(e.target.value)}
              placeholder="e.g. Milk sales, School books"
              className="w-full bg-[#F7F8F5] border border-[#E3E7E4] rounded-xl px-3.5 py-2 text-xs text-[#263238] focus:bg-white focus:outline-none focus:border-[#176B5B]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="flex-1"
              onClick={onClose}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              loading={submitting}
            >
              {t('common.save', 'Save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
