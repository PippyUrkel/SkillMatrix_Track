import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudyTimerProps {
    className?: string;
}

export const StudyTimer: React.FC<StudyTimerProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    const totalTime = isBreak ? 5 * 60 : 25 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    if (!isBreak) {
                        setSessionsCompleted((s) => s + 1);
                        setIsBreak(true);
                        return 5 * 60;
                    } else {
                        setIsBreak(false);
                        return 25 * 60;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isRunning, isBreak]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const reset = useCallback(() => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(25 * 60);
    }, []);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    'fixed bottom-6 left-6 z-40 w-12 h-12 bg-white border border-slate-200 rounded-none shadow-lg flex items-center justify-center hover:shadow-xl hover:border-emerald-300 transition-all group',
                    className
                )}
                title="Study Timer"
            >
                <span className="text-xl group-hover:scale-110 transition-transform">⏱️</span>
            </button>
        );
    }

    return (
        <div className={cn(
            'fixed bottom-6 left-6 z-40 w-64 bg-white border border-slate-200 rounded-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200',
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    {isBreak ? <Coffee className="w-4 h-4 text-amber-500" /> : <span className="text-sm">⏱️</span>}
                    <span className="text-sm font-semibold text-slate-900">
                        {isBreak ? 'Break Time' : 'Focus Session'}
                    </span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Timer Ring */}
            <div className="p-6 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                        <circle
                            cx="64" cy="64" r="56"
                            fill="none"
                            stroke="#E2E8F0"
                            strokeWidth="8"
                        />
                        <circle
                            cx="64" cy="64" r="56"
                            fill="none"
                            stroke={isBreak ? '#F59E0B' : '#10B981'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(progress / 100) * 351.86} 351.86`}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900 font-mono">{formatTime(timeLeft)}</span>
                        <span className="text-xs text-slate-400">{isBreak ? 'break' : 'focus'}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={cn(
                            'w-10 h-10 rounded-none flex items-center justify-center transition-colors',
                            isRunning
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        )}
                    >
                        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <button
                        onClick={reset}
                        className="w-10 h-10 rounded-none bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-xs text-slate-400">
                    {sessionsCompleted} session{sessionsCompleted !== 1 ? 's' : ''} completed · +{sessionsCompleted * 25} XP
                </span>
            </div>
        </div>
    );
};
