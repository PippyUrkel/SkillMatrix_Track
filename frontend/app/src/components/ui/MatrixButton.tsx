import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MatrixButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  title?: string;
}

export const MatrixButton: React.FC<MatrixButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  title,
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-black uppercase tracking-wider border-2 border-black transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1 active:translate-y-1 active:shadow-none';

  const variantStyles = {
    primary: 'bg-brutal-yellow text-black',
    secondary: 'bg-brutal-blue text-black',
    ghost: 'bg-transparent text-black border-transparent shadow-none hover:border-black hover:bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0 hover:translate-y-0',
    danger: 'bg-red-500 text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
