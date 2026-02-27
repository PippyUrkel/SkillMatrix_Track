import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'success' | 'warning' | 'error';
}

export const MatrixProgress: React.FC<MatrixProgressProps> = ({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  size = 'md',
  color = 'accent',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    accent: 'bg-emerald-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('bg-slate-200 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-300', colorStyles[color], barClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-slate-500 mt-1 text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};
