import React from 'react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores';
import {
  Home,
  Zap,
  PlayCircle,
  Briefcase,
  Bot,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'skillgap', label: 'Skill Gap', icon: Zap, path: '/dashboard/skill-gap' },
  { id: 'learning', label: 'My Course', icon: PlayCircle, path: '/dashboard/learning' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/dashboard/jobs' },
  { id: 'aihelper', label: 'AI Helper', icon: Bot, path: '/dashboard/ai-helper' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/dashboard/progress' },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const { user, logout } = useUserStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-slate-200 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <span className="text-slate-900 font-bold text-lg">SkillMatrix</span>
            <p className="text-xs text-slate-400">AI Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-emerald-500')} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100">
        {/* Settings */}
        <button
          onClick={() => onNavigate('/dashboard/settings')}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 mb-2',
            activeItem === 'settings'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 bg-slate-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user ? getInitials(user.fullName) : 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-sm font-medium truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-slate-400 text-xs truncate">Level {user?.level}</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
