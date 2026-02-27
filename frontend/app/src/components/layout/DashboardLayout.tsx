import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useDashboardStore } from '@/stores';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeItem: string;
  onNavigate: (path: string) => void;
  title: string;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeItem,
  onNavigate,
  title,
  className,
}) => {
  const { isSidebarCollapsed } = useDashboardStore();

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className={cn(
        'min-h-screen flex flex-col transition-all duration-300',
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      )}>
        {/* Top Bar */}
        <TopBar title={title} onNavigate={onNavigate} />

        {/* Page Content */}
        <main className={cn('flex-1 p-8 overflow-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
