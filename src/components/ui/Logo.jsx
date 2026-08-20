import React from 'react';

export const SKAgroLogo = ({ className = 'h-10 w-auto', showText = true, textClassName = '' }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="sk-agro-logo.jpg"
        alt="S K Agro Chemical Logo"
        className="h-full w-auto object-contain shrink-0 rounded-lg"
      />
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
            S K AGRO
          </span>
          <span className="text-[10px] font-extrabold text-[#7AC143] tracking-widest uppercase mt-0.5">
            CHEMICAL
          </span>
        </div>
      )}
    </div>
  );
};
