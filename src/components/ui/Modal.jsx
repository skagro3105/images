import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Card Box */}
      <div
        className={`relative transform rounded-2xl bg-white dark:bg-[#111815] border border-slate-200 dark:border-emerald-950/80 text-left shadow-2xl transition-all w-full max-h-[82vh] sm:max-h-[88vh] flex flex-col z-[10000] my-auto ${maxWidth}`}
      >
        {/* Header - Sticky & prominent close button */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-emerald-950/80 px-4 sm:px-6 py-3.5 sm:py-4 shrink-0 bg-white dark:bg-[#111815] rounded-t-3xl sm:rounded-t-2xl">
          <div className="min-w-0 flex-1 pr-3">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 bg-slate-100 dark:bg-[#16201C] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#202E28] hover:text-slate-900 dark:hover:text-white transition-all shrink-0 border border-slate-200 dark:border-emerald-950"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body - Full scrollable */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
