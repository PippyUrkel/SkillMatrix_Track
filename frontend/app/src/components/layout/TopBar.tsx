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
        'h-16 bg-white border-b-4 border-black flex items-center justify-between px-6',
        className
      )}
    >
      {/* Page Title */}
      <h1 className="text-black font-black text-lg uppercase tracking-wider">{title}</h1>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" strokeWidth={3} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-white border-2 border-black text-black text-sm pl-10 pr-4 py-2 w-64 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,222,89,1)] transition-all font-medium"
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
            className="relative p-2 text-black/60 hover:text-black hover:bg-brutal-yellow border-2 border-transparent hover:border-black transition-all"
          >
            <Bell className="w-5 h-5" strokeWidth={2.5} />
            {notifications > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-brutal-pink text-black text-xs font-black border-2 border-black flex items-center justify-center">
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
            className="w-9 h-9 bg-brutal-pink border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="text-black font-black text-xs">
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
