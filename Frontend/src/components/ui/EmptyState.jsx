import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`text-center py-10 px-4 bg-white rounded-2xl border border-[#E3E7E4] shadow-subtle ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#DDEDE7] text-[#176B5B] flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-[#263238] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
