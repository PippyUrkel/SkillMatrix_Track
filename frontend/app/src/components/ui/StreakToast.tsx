import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

interface StreakToastProps {
    streak: number;
    visible: boolean;
    onDismiss: () => void;
}

export const StreakToast: React.FC<StreakToastProps> = ({ streak, visible, onDismiss }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (visible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onDismiss, 300); // Wait for exit animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible, onDismiss]);

    if (!visible) return null;

    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 z-50 transition-all duration-300',
                show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            )}
        >
            <div className="flex items-center gap-3 bg-white border border-emerald-200 rounded-none px-5 py-4 shadow-xl shadow-emerald-100/40">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-none flex items-center justify-center animate-pulse">
                    <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">
                        🔥 {streak} Day Streak!
                    </p>
                    <p className="text-xs text-slate-500">Keep the momentum going!</p>
                </div>
            </div>
        </div>
    );
};
