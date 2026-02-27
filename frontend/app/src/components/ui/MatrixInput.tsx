import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixInputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  label?: string;
  error?: string;
}

export const MatrixInput: React.FC<MatrixInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  maxLength,
  label,
  error,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-[#A7B4AD] mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={cn(
          'w-full bg-[#050605] border border-[#1F1F1F] text-white px-4 py-3 rounded-none',
          'placeholder:text-[#6B7280]',
          'focus:outline-none focus:border-[#2EE9A8] focus:ring-1 focus:ring-[rgba(46,233,168,0.3)]',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
      {maxLength && (
        <p className="mt-1 text-xs text-[#6B7280] text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};
