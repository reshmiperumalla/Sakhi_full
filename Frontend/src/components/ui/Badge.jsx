import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'neutral' | 'success' | 'warning' | 'danger' | 'primary'
  size = 'md',
  className = ''
}) {
  const variantStyles = {
    neutral: 'bg-[#F0F2EE] text-[#475467] border border-[#E3E7E4]',
    primary: 'bg-[#DDEDE7] text-[#176B5B] border border-[#B8D8CE]',
    success: 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]',
  }[variant] || 'bg-[#F0F2EE] text-[#475467]';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-full',
  }[size] || 'text-xs px-2.5 py-1 rounded-full';

  return (
    <span className={`inline-flex items-center gap-1 leading-none ${variantStyles} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
}
