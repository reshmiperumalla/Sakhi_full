import React from 'react';

export function Card({ children, className = '', onClick, hover = false }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#E3E7E4] shadow-subtle p-5 sm:p-6 ${
        hover ? 'hover:border-[#CBD5E1] transition cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
