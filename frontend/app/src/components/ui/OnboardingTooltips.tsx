import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Zap, Bot, Flame, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipStep {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

const steps: TooltipStep[] = [
    {
        id: 'skillgap',
        title: 'Skill Gap Analysis',
        description: 'See exactly which skills you need for your target role — powered by market data.',
        icon: Zap,
    },
    {
        id: 'ai',
        title: 'AI Learning Assistant',
        description: 'Press Ctrl+/ or click "AI Help" on any course to get contextual help.',
        icon: Bot,
    },
    {
        id: 'streak',
        title: 'Learning Streak',
        description: 'Keep your streak alive! Study daily to build momentum and earn bonus XP.',
        icon: Flame,
    },
    {
        id: 'command',
        title: 'Command Palette',
        description: 'Press Ctrl+K anytime to instantly search and navigate to any page.',
        icon: Command,
    },
];

const STORAGE_KEY = 'skillmatrix_onboarding_complete';

export const OnboardingTooltips: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [dismissed, setDismissed] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            setDismissed(false);
        }
    }, []);

    const handleComplete = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setDismissed(true);
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    if (dismissed) return null;

    const step = steps[currentStep];
    const Icon = step.icon;

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] flex items-center justify-center">
            <div className="w-full max-w-sm bg-white border border-slate-200 rounded-none shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs text-slate-400 font-medium">
                        Welcome Tour · {currentStep + 1}/{steps.length}
                    </span>
                    <button
                        onClick={handleComplete}
                        className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="w-14 h-14 bg-emerald-50 rounded-none flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5 pb-4">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-2 h-2 rounded-none transition-all',
                                i === currentStep ? 'bg-emerald-500 w-6' : 'bg-slate-200'
                            )}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className={cn(
                            'flex items-center gap-1 text-sm font-medium transition-colors',
                            currentStep === 0 ? 'text-slate-300' : 'text-slate-600 hover:text-slate-900'
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleComplete}
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Skip tour
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-none hover:bg-emerald-600 transition-colors"
                        >
                            {currentStep === steps.length - 1 ? "Let's go!" : 'Next'}
                            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
