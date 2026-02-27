import React from 'react';
import { cn } from '@/lib/utils';

interface MatrixToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  label?: string;
  description?: string;
}

export const MatrixToggle: React.FC<MatrixToggleProps> = ({
  checked,
  onChange,
  className,
  label,
  description,
}) => {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div className="flex-1">
        {label && (
          <label className="block text-sm font-medium text-slate-900">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-none transition-colors duration-200',
          checked ? 'bg-emerald-500' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 bg-white rounded-none transition-transform duration-200',
            checked && 'translate-x-6'
          )}
        />
      </button>
    </div>
  );
};
