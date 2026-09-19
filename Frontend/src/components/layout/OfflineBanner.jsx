import React from 'react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';
import { WifiOff, RefreshCw } from 'lucide-react';

export function OfflineBanner() {
  const { isOnline, pendingCount, syncing, syncNow } = useOffline();
  const { t } = useLanguage();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="py-2 px-4 text-xs font-medium bg-[#FCFAF2] border-b border-[#ECE6D5] text-[#263238]">
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff className="w-3.5 h-3.5 text-[#D4B04C]" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-[#176B5B] animate-spin" />
          )}
          <span>
            {!isOnline
              ? t('common.offline')
              : `${pendingCount} ${t('common.sync')}`}
          </span>
        </div>

        {isOnline && pendingCount > 0 && (
          <button
            onClick={syncNow}
            disabled={syncing}
            className="px-2.5 py-1 rounded-lg bg-[#176B5B] text-white text-xs font-semibold hover:bg-[#125447] transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? t('common.syncing') : t('common.sync')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
