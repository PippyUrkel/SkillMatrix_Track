import React from 'react';
import { cn } from '@/lib/utils';
import {
  Home,
  Zap,
  PlayCircle,
  Briefcase,
  BarChart3,
  Users,
  Settings,
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
  { id: 'community', label: 'Community', icon: Users, path: '/dashboard/community' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/dashboard/progress' },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const { isSidebarCollapsed, toggleSidebar } = useDashboardStore();

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white border-r-4 border-black flex flex-col z-40 transition-all duration-300',
      isSidebarCollapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo & Toggle */}
      <div className={cn(
        'p-6 border-b-4 border-black flex items-center transition-all',
        isSidebarCollapsed ? 'justify-center p-4' : 'justify-between'
      )}>
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brutal-yellow border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-black font-black text-lg">S</span>
            </div>
            <div>
              <span className="text-black font-black text-lg tracking-tight">SkillMatrix</span>
              <p className="text-xs text-black/50 font-bold">AI Learning</p>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            'p-2 text-black/60 hover:text-black hover:bg-brutal-yellow transition-all border-2 border-transparent hover:border-black',
            isSidebarCollapsed && 'bg-brutal-yellow border-black text-black'
          )}
        >
          {isSidebarCollapsed ? <Menu className="w-6 h-6" strokeWidth={3} /> : <ChevronLeft className="w-6 h-6" strokeWidth={3} />}
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
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-150',
                    isActive
                      ? 'bg-brutal-yellow text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'text-black/70 hover:text-black hover:bg-brutal-yellow/30',
                    isSidebarCollapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-black')} strokeWidth={isActive ? 3 : 2} />
                  {!isSidebarCollapsed && <span className="uppercase tracking-wide text-xs">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t-4 border-black">
        {/* Settings */}
        <button
          onClick={() => onNavigate('/dashboard/settings')}
          title={isSidebarCollapsed ? 'Settings' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all duration-150 mb-2',
            activeItem === 'settings'
              ? 'bg-brutal-yellow text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'text-black/70 hover:text-black hover:bg-brutal-yellow/30',
            isSidebarCollapsed && 'justify-center px-0'
          )}
        >
          <Settings className="w-5 h-5" strokeWidth={activeItem === 'settings' ? 3 : 2} />
          {!isSidebarCollapsed && <span className="uppercase tracking-wide text-xs">Settings</span>}
        </button>
      </div>
    </aside>
  );
};
