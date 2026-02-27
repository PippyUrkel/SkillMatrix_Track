import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export const MatrixCard = React.forwardRef<HTMLDivElement, MatrixCardProps>(({
  children,
  className,
  glow = false,
  hover = true,
  onClick,
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'bg-white border-2 border-black rounded-none p-6 shadow-sm',
        hover && 'hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 translate-x-0 translate-y-0 hover:-translate-x-1 hover:-translate-y-1',
        glow && 'shadow-emerald-100',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
});

MatrixCard.displayName = 'MatrixCard';
