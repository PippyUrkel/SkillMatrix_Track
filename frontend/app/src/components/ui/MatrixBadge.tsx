import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface MatrixBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export const MatrixBadge: React.FC<MatrixBadgeProps> = ({
  children,
  variant = 'accent',
  className,
  size = 'sm',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    accent: 'bg-emerald-100 text-emerald-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-600',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
