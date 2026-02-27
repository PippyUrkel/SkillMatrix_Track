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
          <label className="block text-sm font-medium text-white">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-[#A7B4AD] mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-200',
          checked ? 'bg-[#2EE9A8]' : 'bg-[#1F1F1F]'
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
            checked && 'translate-x-6'
          )}
        />
      </button>
    </div>
  );
};
