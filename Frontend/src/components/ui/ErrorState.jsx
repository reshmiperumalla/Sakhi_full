import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../../context/LanguageContext';

export function ErrorState({
  title,
  message,
  onRetry,
  className = ''
}) {
  const { t } = useLanguage();

  return (
    <div className={`text-center py-8 px-4 bg-[#FEF2F2] rounded-2xl border border-[#FEE2E2] ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-red-900 mb-1">
        {title || t('common.error_title')}
      </h3>
      {message && <p className="text-xs text-red-700 mb-3">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('common.try_again')}
        </Button>
      )}
    </div>
  );
}
