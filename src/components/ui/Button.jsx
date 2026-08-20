import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-[#0F5132] hover:bg-[#0B3D26] text-white shadow-xs',
    secondary: 'bg-white dark:bg-[#141E19] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-emerald-950/60 hover:bg-slate-50 dark:hover:bg-[#1B2721] shadow-xs',
    ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#141E19] hover:text-slate-900 dark:hover:text-white',
    outline: 'border border-emerald-700 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-2 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[42px]',
    lg: 'text-base px-5 py-3 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`shrink-0 ${size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5'}`} />}
      {children}
    </button>
  );
};
