import React from 'react';

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
  );
};
