import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`skeleton-shimmer rounded-lg ${className}`} />
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
    <Skeleton className="h-44 w-full rounded-lg" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-6 w-20 rounded-md" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const AssetCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden p-3 space-y-2">
    <Skeleton className="h-36 w-full rounded-lg" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex justify-between items-center pt-1">
      <Skeleton className="h-5 w-16 rounded-md" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
);
