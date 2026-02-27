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
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { useDashboardStore } from '@/stores';

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
  const { isSidebarCollapsed, toggleSidebar } = useDashboardStore();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white border-r-2 border-black flex flex-col z-40 transition-all duration-300',
      isSidebarCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo & Toggle */}
      <div className={cn(
        'p-6 border-b-2 border-black flex items-center transition-all',
        isSidebarCollapsed ? 'justify-center p-4' : 'justify-between'
      )}>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-brutal-yellow overflow-hidden">
              <img src="/logo.png" alt="SkillMatrix Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-slate-900 font-bold text-lg">SkillMatrix</span>
              <p className="text-xs text-slate-400">AI Learning</p>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            'p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-none transition-all',
            isSidebarCollapsed && 'bg-slate-50 text-slate-900'
          )}
        >
          {isSidebarCollapsed ? <Menu className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
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
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    isSidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-emerald-500')} />
                  {!isSidebarCollapsed && item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t-2 border-black">
        {/* Settings */}
        <button
          onClick={() => onNavigate('/dashboard/settings')}
          title={isSidebarCollapsed ? 'Settings' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium transition-all duration-150 mb-2',
            activeItem === 'settings'
              ? 'bg-emerald-50 text-emerald-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
            isSidebarCollapsed && 'justify-center px-0'
          )}
        >
          <Settings className="w-5 h-5" />
          {!isSidebarCollapsed && 'Settings'}
        </button>

        {/* User Profile */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-3 mt-2 bg-slate-50 rounded-none overflow-hidden transition-all',
          isSidebarCollapsed ? 'justify-center px-2' : ''
        )}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-none flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {user ? getInitials(user.fullName) : 'U'}
            </span>
          </div>
          {!isSidebarCollapsed && (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
