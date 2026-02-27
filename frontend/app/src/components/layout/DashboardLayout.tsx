import React from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

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
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar activeItem={activeItem} onNavigate={onNavigate} />

      {/* Main Content */}
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar title={title} />

        {/* Page Content */}
        <main className={cn('flex-1 p-8 overflow-auto', className)}>
          {children}
        </main>
      </div>
    </div>
  );
};
