import React, { useRef, useEffect } from 'react';
import { BookOpen, Trophy, Briefcase, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'achievement' | 'course' | 'job' | 'reminder';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const defaultNotifications: Notification[] = [
    { id: '1', type: 'achievement', title: 'Achievement Unlocked!', message: 'You earned "7-Day Streak" badge', time: '2m ago', read: false },
    { id: '2', type: 'job', title: 'New Job Match', message: 'Senior Frontend Dev at Google — 92% fit', time: '1h ago', read: false },
    { id: '3', type: 'course', title: 'Course Reminder', message: 'Continue "System Design Interviews"', time: '3h ago', read: true },
    { id: '4', type: 'reminder', title: 'Weekly Report', message: 'Your skill score improved by 8% this week', time: '1d ago', read: true },
];

const typeIcons = {
    achievement: Trophy,
    course: BookOpen,
    job: Briefcase,
    reminder: CheckCircle,
};

const typeColors = {
    achievement: 'text-amber-500 bg-amber-50',
    course: 'text-emerald-500 bg-emerald-50',
    job: 'text-blue-500 bg-blue-50',
    reminder: 'text-purple-500 bg-purple-50',
};

interface NotificationPanelProps {
    open: boolean;
    onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose]);

    if (!open) return null;

    const unreadCount = defaultNotifications.filter((n) => !n.read).length;

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-none shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-slate-900 font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-none font-medium">
                        {unreadCount} new
                    </span>
                )}
            </div>

            <div className="max-h-80 overflow-y-auto">
                {defaultNotifications.map((notification) => {
                    const Icon = typeIcons[notification.type];
                    const colorClass = typeColors[notification.type];

                    return (
                        <div
                            key={notification.id}
                            className={cn(
                                'flex items-start gap-3 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer',
                                !notification.read && 'bg-emerald-50/30'
                            )}
                        >
                            <div className={cn('w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0', colorClass)}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-medium', notification.read ? 'text-slate-600' : 'text-slate-900')}>
                                    {notification.title}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {notification.time}
                                </span>
                                {!notification.read && (
                                    <div className="w-2 h-2 bg-emerald-500 rounded-none" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-3 border-t border-slate-100">
                <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium py-1">
                    View All Notifications
                </button>
            </div>
        </div>
    );
};
