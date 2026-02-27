import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores';
import { Bell, Search } from 'lucide-react';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';
import { NotificationPanel } from '@/components/ui/NotificationPanel';

interface TopBarProps {
  title: string;
  className?: string;
  onNavigate?: (path: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, className, onNavigate }) => {
  const { user, notifications } = useUserStore();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6',
        className
      )}
    >
      {/* Page Title */}
      <h1 className="text-slate-900 font-semibold text-lg">{title}</h1>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-none pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
          />
        </div>

        {/* 🔥 Streak Counter */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-none hover:bg-orange-100 transition-colors group">
          <span className="text-lg animate-pulse group-hover:animate-bounce">🔥</span>
          <span className="text-sm font-bold text-orange-600">{user?.streak || 0}</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-none transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-none flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
          <NotificationPanel
            open={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        {/* Avatar / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="w-9 h-9 rounded-none bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center hover:ring-2 hover:ring-emerald-200 transition-all cursor-pointer"
          >
            <span className="text-white font-bold text-xs">
              {user ? getInitials(user.fullName) : 'U'}
            </span>
          </button>
          <ProfileDropdown
            open={showProfile}
            onClose={() => setShowProfile(false)}
            onNavigate={onNavigate || (() => { })}
          />
        </div>
      </div>
    </header>
  );
};
