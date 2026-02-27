import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => {
  return (
    <div className="flex items-center justify-center">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;

        return (
          <React.Fragment key={stepNumber}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 border-2',
                  isCompleted && 'bg-emerald-500 border-emerald-500 text-white',
                  isCurrent && 'bg-white border-emerald-500 text-emerald-500',
                  isFuture && 'bg-white border-slate-200 text-slate-400'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium',
                  isCompleted && 'text-emerald-600',
                  isCurrent && 'text-slate-900',
                  isFuture && 'text-slate-400'
                )}
              >
                {labels[index]}
              </span>
            </div>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  'w-16 h-0.5 mx-2 mb-6 transition-colors duration-200',
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
