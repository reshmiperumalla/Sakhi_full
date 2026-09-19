import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, Check, CornerDownLeft, CheckCircle2 } from 'lucide-react';

export function NaturalLanguageInput({ onTransactionsSaved, initialText = '' }) {
  const { t, currentLanguage } = useLanguage();
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

  const handleParse = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setParseResult(null);
    setSavedSuccess(false);

    try {
      const data = await api.parseNaturalTransaction(text, currentLanguage, false);
      setParseResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!parseResult || !parseResult.extracted_items || parseResult.extracted_items.length === 0) return;
    setSaving(true);
    try {
      for (const item of parseResult.extracted_items) {
        await api.createTransaction({
          type: item.type,
          amount: item.amount,
          category: item.category,
          source_or_item: item.source_or_item,
          is_irregular: item.is_irregular
        });
      }
      setSavedSuccess(true);
      setText('');
      setParseResult(null);
      if (onTransactionsSaved) onTransactionsSaved();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#DDEDE7] flex items-center justify-center text-[#176B5B]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#263238]">
              {t('transactions.smart_tab')}
            </h3>
            <p className="text-xs text-[#667085]">
              {t('transactions.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-[#DDEDE7] border border-[#B8D8CE] text-[#176B5B] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{t('transactions.saved_success')}</span>
        </div>
      )}

      {/* Input box */}
      <div className="relative">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('transactions.natural_input_placeholder')}
          className="w-full p-3 text-sm rounded-xl border border-[#E3E7E4] focus:border-[#176B5B] focus:outline-none text-[#263238] placeholder:text-[#94A3B8] resize-none"
        />

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            size="sm"
            disabled={!text.trim() || loading}
            onClick={handleParse}
            icon={CornerDownLeft}
          >
            {loading ? t('transactions.analyzing') : t('transactions.parse_button')}
          </Button>
        </div>
      </div>

      {/* Parse Result Summary */}
      {parseResult && (
        <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#E3E7E4] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
              {t('transactions.extracted_preview')}
            </span>
            <span className="text-xs text-[#667085]">
              {parseResult.extracted_items?.length || 0} {t('transactions.items_identified')}
            </span>
          </div>

          <div className="space-y-2">
            {(parseResult.extracted_items || []).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#E3E7E4] text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                      item.type === 'income'
                        ? 'bg-[#DDEDE7] text-[#176B5B]'
                        : 'bg-[#F2F4F7] text-[#475467]'
                    }`}
                  >
                    {item.type === 'income' ? t('transactions.income') : t('transactions.expense')}
                  </span>
                  <span className="font-medium text-[#263238]">
                    {item.source_or_item || item.category}
                  </span>
                </div>
                <span className="font-bold text-sm text-[#263238]">
                  {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E3E7E4] flex items-center justify-between">
            <div className="text-xs text-[#667085]">
              {t('transactions.total_in')} <strong className="text-[#176B5B]">{formatCurrency(parseResult.total_inflow || 0)}</strong> | {t('transactions.total_out')} <strong className="text-[#263238]">{formatCurrency(parseResult.total_outflow || 0)}</strong>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAll}
              disabled={saving}
              icon={Check}
            >
              {saving ? t('transactions.saving') : t('transactions.save_all')}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
