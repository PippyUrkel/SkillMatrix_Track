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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-none border-2 border-transparent transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0 active:translate-y-0 active:shadow-none';

  const variantStyles = {
    primary: 'bg-emerald-500 border-black text-white hover:bg-emerald-400',
    secondary: 'bg-white border-black text-emerald-600 hover:bg-emerald-50',
    ghost: 'bg-transparent text-slate-800 hover:border-black hover:bg-slate-50',
    danger: 'bg-red-500 border-black text-white hover:bg-red-400',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
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
