import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import {
  TrendingUp,
  TrendingDown,
  Trash2,
  Wallet
} from 'lucide-react';

export function TransactionList({ refreshTrigger }) {
  const { t, currentLanguage } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions({
        type: filterType === 'all' ? undefined : filterType
      });
      setTransactions(data);
    } catch (e) {
      console.warn('Load transactions fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filterType, refreshTrigger, currentLanguage]);

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await api.deleteTransaction(id);
      loadTransactions();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryLabel = (category, type) => {
    if (!category) return '';
    const dictKey = type === 'income'
      ? `transactions.categories_income.${category}`
      : `transactions.categories_expense.${category}`;
    return t(dictKey, category.replace('_', ' '));
  };

  return (
    <Card className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E3E7E4]">
        <h2 className="text-sm font-semibold text-[#263238]">
          {t('transactions.recent_title')}
        </h2>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1 bg-[#F7F8F5] p-1 rounded-xl border border-[#E3E7E4]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-[#176B5B] shadow-xs'
                : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            {t('transactions.filter_all')}
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'income'
                ? 'bg-white text-[#176B5B] shadow-xs'
                : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            {t('transactions.income')}
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'expense'
                ? 'bg-white text-[#176B5B] shadow-xs'
                : 'text-[#667085] hover:text-[#263238]'
            }`}
          >
            {t('transactions.expense')}
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-[#667085]">
          {t('transactions.loading')}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-xl bg-[#F7F8F5] border border-[#E3E7E4] flex items-center justify-center text-[#667085]">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#667085] max-w-sm mx-auto">
            {t('transactions.empty')}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E3E7E4]">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const dateStr = tx.date
              ? new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : t('transactions.recent_date');

            return (
              <div
                key={tx._id || tx.id || tx.client_id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-[#F7F8F5] px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome
                        ? 'bg-[#DDEDE7] text-[#176B5B]'
                        : 'bg-[#F2F4F7] text-[#667085]'
                    }`}
                  >
                    {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#263238] truncate">
                      {tx.source_or_item || getCategoryLabel(tx.category, tx.type)}
                    </div>
                    <div className="text-xs text-[#667085] flex items-center gap-2">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{getCategoryLabel(tx.category, tx.type)}</span>
                      {tx.is_irregular && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FCFAF2] border border-[#ECE6D5] text-[#8A6D1C]">
                          {t('transactions.variable')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isIncome ? 'text-[#176B5B]' : 'text-[#263238]'
                    }`}
                  >
                    {isIncome ? `+${formatCurrency(tx.amount)}` : `-${formatCurrency(tx.amount)}`}
                  </span>

                  <button
                    onClick={() => handleDelete(tx._id || tx.id || tx.client_id)}
                    title={t('transactions.delete')}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#94A3B8] hover:text-[#C54B4B] rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
