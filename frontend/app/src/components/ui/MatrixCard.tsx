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
        'bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        hover && 'hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1',
        glow && 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
});

MatrixCard.displayName = 'MatrixCard';
