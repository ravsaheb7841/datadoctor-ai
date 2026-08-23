import React from 'react';
export const SkeletonCard = ({ className = '' }) => (
  <div className={`shimmer rounded-xl p-4 ${className}`}>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/3"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
  </div>
);
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-2"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
);
export const SkeletonChart = ({ height = 200 }) => (
  <div className="shimmer rounded-xl" style={{ height }}></div>
);
export const SkeletonText = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${90 - i * 15}%` }}></div>
    ))}
  </div>
);
export default SkeletonCard;
