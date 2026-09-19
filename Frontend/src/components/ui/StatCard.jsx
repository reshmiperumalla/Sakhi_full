import React from 'react';
import { formatCurrency } from '../../lib/utils';

export function StatCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'neutral' // 'neutral' | 'sage' | 'warm'
}) {
  const bgStyles = {
    neutral: 'bg-white border-[#E3E7E4]',
    sage: 'bg-[#F2F7F5] border-[#D3E5DE]',
    warm: 'bg-[#FCFAF2] border-[#ECE6D5]'
  }[variant] || 'bg-white border-[#E3E7E4]';

  return (
    <div className={`p-5 rounded-2xl border shadow-subtle flex flex-col justify-between ${bgStyles}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#667085] tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/80 border border-[#E3E7E4] flex items-center justify-center text-[#176B5B] shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#263238]">
          {formatCurrency(amount || 0)}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-[#667085] font-normal truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
