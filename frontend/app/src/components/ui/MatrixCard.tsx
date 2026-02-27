import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const MatrixCard: React.FC<MatrixCardProps> = ({
  children,
  className,
  glow = false,
  hover = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-6 shadow-sm',
        hover && 'hover:shadow-md hover:border-emerald-200 transition-all duration-200',
        glow && 'shadow-emerald-100',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
