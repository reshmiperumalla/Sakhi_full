import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  type = 'button',
  icon: Icon,
  className = '',
  title
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5'
  }[size] || 'px-4 py-2.5 text-sm gap-2';

  const variantStyles = {
    primary: 'bg-[#176B5B] hover:bg-[#125447] text-white shadow-subtle',
    secondary: 'bg-[#DDEDE7] hover:bg-[#C8E0D7] text-[#176B5B]',
    outline: 'bg-white border border-[#E3E7E4] hover:border-[#CBD5E1] hover:bg-[#F7F8F5] text-[#263238] shadow-subtle',
    ghost: 'bg-transparent hover:bg-[#F0F2EE] text-[#263238]',
    danger: 'bg-[#FEF2F2] border border-[#FEE2E2] hover:bg-[#FEE2E2] text-[#C54B4B]'
  }[variant] || 'bg-[#176B5B] text-white';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />}
      <span>{children}</span>
    </button>
  );
}
