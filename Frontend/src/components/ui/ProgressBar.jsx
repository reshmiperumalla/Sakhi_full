import React from 'react';

export function ProgressBar({ progress = 0, className = '' }) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full h-2.5 bg-[#EFEFEA] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-[#176B5B] rounded-full transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
