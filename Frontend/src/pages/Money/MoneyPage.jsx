import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { NaturalLanguageInput } from '../../components/transactions/NaturalLanguageInput';
import { AddTransactionModal } from '../../components/transactions/AddTransactionModal';
import { EditTransactionModal } from '../../components/transactions/EditTransactionModal';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Trash2, 
  Edit2,
  Filter,
  Calendar,
  Sparkles,
  Search
} from 'lucide-react';

export function MoneyPage() {
  const { t, currentLanguage } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, net_balance: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [timeFilter, setTimeFilter] = useState('month'); // 'month', 'year'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('expense');
  const [editingTx, setEditingTx] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const [data, sumData] = await Promise.all([
        api.getTransactions({
          type: filterType === 'all' ? undefined : filterType
        }),
        api.getDashboardSummary()
      ]);
      setTransactions(Array.isArray(data) ? data : []);
      if (sumData) {
        setSummary({
          total_income: sumData.total_income ?? 0,
          total_expenses: sumData.total_expenses ?? 0,
          net_balance: sumData.net_balance ?? 0
        });
      }
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const handleSync = () => fetchTransactions();
    window.addEventListener('mitra_financial_mutation', handleSync);
    return () => window.removeEventListener('mitra_financial_mutation', handleSync);
  }, [filterType, timeFilter, refreshTrigger, currentLanguage]);

  const handleDelete = async (id) => {
    if (!id || !window.confirm(t('transactions.delete_confirm'))) return;
    try {
      await api.deleteTransaction(id);
      api.dispatchFinancialMutation();
      setRefreshTrigger((prev) => prev + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // Live unified backend sums
  const totalIn = summary.total_income;
  const totalOut = summary.total_expenses;
  const netBalance = summary.net_balance;

  const formatCurrency = (amount) => `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;

  const categoryIcons = {
    household: '🏠',
    food: '🍲',
    education: '📚',
    healthcare: '🏥',
    agriculture: '🌾',
    dairy: '🐄',
    tailoring: '🧵',
    salary: '💼',
    small_business: '🏪',
    other: '📦'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight">
            {t('transactions.title')}
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            {t('transactions.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setAddModalType('expense');
              setIsAddModalOpen(true);
            }}
          >
            {t('transactions.record_new')}
          </Button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] text-[#137333] flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_in')}
            </span>
            <div className="text-xl font-bold text-[#137333]">{formatCurrency(totalIn)}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#C54B4B] flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_out')}
            </span>
            <div className="text-xl font-bold text-[#C54B4B]">{formatCurrency(totalOut)}</div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
              {t('dashboard.money_left')}
            </span>
            <div className="text-xl font-bold text-[#176B5B]">{formatCurrency(netBalance)}</div>
          </div>
        </div>
      </div>

      {/* Natural Language Voice & Text Box */}
      <NaturalLanguageInput
        onTransactionsSaved={() => setRefreshTrigger((p) => p + 1)}
      />

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E3E7E4] shadow-subtle flex flex-wrap items-center justify-between gap-3">
        {/* Type Filter */}
        <div className="inline-flex bg-[#F7F8F5] p-1 rounded-xl border border-[#E3E7E4]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all' ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
            }`}
          >
            {t('transactions.filter_all')}
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'income' ? 'bg-white text-[#137333] shadow-xs' : 'text-[#667085]'
            }`}
          >
            {t('transactions.filter_income')}
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'expense' ? 'bg-white text-[#C54B4B] shadow-xs' : 'text-[#667085]'
            }`}
          >
            {t('transactions.filter_expense')}
          </button>
        </div>

        {/* Time Filter */}
        <div className="inline-flex bg-[#F7F8F5] p-1 rounded-xl border border-[#E3E7E4]">
          <button
            onClick={() => setTimeFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'month' ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
            }`}
          >
            {t('transactions.time_this_month')}
          </button>
          <button
            onClick={() => setTimeFilter('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              timeFilter === 'year' ? 'bg-white text-[#176B5B] shadow-xs' : 'text-[#667085]'
            }`}
          >
            {t('transactions.time_this_year')}
          </button>
        </div>
      </div>

      {/* Transactions Ledger List */}
      <div className="bg-white rounded-2xl border border-[#E3E7E4] shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085]">
            {t('common.loading')}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={t('transactions.empty_ledger')}
            description={t('transactions.empty_ledger_desc')}
            actionLabel={t('transactions.empty_ledger_btn')}
            onAction={() => {
              setAddModalType('expense');
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <div className="divide-y divide-[#F0F2EE]">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const catKey = tx.category || 'other';
              const icon = categoryIcons[catKey] || '📦';
              const categoryDisplayName = t(`dashboard.categories.${catKey}`, catKey.replace('_', ' ').toUpperCase());

              return (
                <div
                  key={tx.id || tx._id}
                  className="p-4 flex items-center justify-between hover:bg-[#FAFBF9] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8F5] border border-[#E3E7E4] flex items-center justify-center text-lg shrink-0">
                      {icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#263238]">
                        {tx.source_or_item || categoryDisplayName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
                        <span>{categoryDisplayName}</span>
                        <span>•</span>
                        <span>{new Date(tx.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        {tx.is_irregular && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FEF3C7] text-[#92400E] font-medium">
                            {t('transactions.freq_seasonal')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold mr-1 ${isIncome ? 'text-[#137333]' : 'text-[#C54B4B]'}`}>
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => setEditingTx(tx)}
                      className="p-1.5 text-[#98A2B3] hover:text-[#176B5B] hover:bg-[#F0F7F4] rounded-lg transition cursor-pointer"
                      title={t('common.edit', 'Edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tx.id || tx._id)}
                      className="p-1.5 text-[#98A2B3] hover:text-[#C54B4B] hover:bg-[#FEF2F2] rounded-lg transition cursor-pointer"
                      title={t('common.delete', 'Delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        initialType={addModalType}
        onClose={() => setIsAddModalOpen(false)}
        onTransactionAdded={() => {
          api.dispatchFinancialMutation();
          setRefreshTrigger((p) => p + 1);
        }}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTx)}
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onTransactionUpdated={() => {
          api.dispatchFinancialMutation();
          setRefreshTrigger((p) => p + 1);
        }}
      />
    </div>
  );
}
