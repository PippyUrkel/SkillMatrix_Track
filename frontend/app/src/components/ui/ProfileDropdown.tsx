import React, { useRef, useEffect } from 'react';
import { useUserStore } from '@/stores';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react';

interface ProfileDropdownProps {
    open: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ open, onClose, onNavigate }) => {
    const { user, logout } = useUserStore();
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

    const getInitials = (name: string) =>
        name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div
            ref={ref}
            className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-none shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* User Info */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-none bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                            {user ? getInitials(user.fullName) : 'U'}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-slate-900 font-semibold truncate">{user?.fullName || 'User'}</p>
                        <p className="text-slate-400 text-sm truncate">{user?.email || 'user@example.com'}</p>
                        <p className="text-emerald-500 text-xs font-medium">Level {user?.level} · {user?.xp} XP</p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="p-2">
                <button
                    onClick={() => { onNavigate('/dashboard/progress'); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <User className="w-4 h-4" />
                    <span className="flex-1 text-left">View Profile</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button
                    onClick={() => { onNavigate('/dashboard/settings'); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    <span className="flex-1 text-left">Settings</span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
            </div>

            {/* Logout */}
            <div className="p-2 border-t border-slate-100">
                <button
                    onClick={() => { logout(); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Log Out
                </button>
            </div>
        </div>
    );
};
