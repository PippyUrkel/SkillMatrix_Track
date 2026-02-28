import React, { useState } from 'react';
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
  HelpCircle,
  Award,
} from 'lucide-react';
import { useDashboardStore } from '@/stores';
import { useUserStore } from '@/stores/userStore';
import { AllCertificatesModal } from '@/features/certificates';
import { CertificateModal as UICertificateModal } from '@/components/ui/CertificateModal';

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
  { id: 'quizzes', label: 'Practice Quizzes', icon: HelpCircle, path: '/dashboard/quizzes' },
  { id: 'jobs', label: 'Tech Jobs', icon: Briefcase, path: '/dashboard/jobs' },
  { id: 'community', label: 'Community', icon: Users, path: '/dashboard/community' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/dashboard/progress' },
];

interface SidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate }) => {
  const { isSidebarCollapsed, toggleSidebar, courses } = useDashboardStore();
  const user = useUserStore((state) => state.user);

  const completedCourses = (courses || []).filter(c => c.status === 'completed' || c.progress === 100);
  const [isAllCertModalOpen, setIsAllCertModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<any>(null);

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
        {/* Cascading Certificates Preview */}
        {!isSidebarCollapsed && completedCourses.length > 0 && (
          <div
            onClick={() => setIsAllCertModalOpen(true)}
            className="mb-4 p-3 bg-slate-50 border-2 border-black hover:bg-brutal-yellow transition-colors cursor-pointer group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 relative z-10"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-black">My Certificates</span>
              <Award className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>

            {/* Cascading visuals */}
            <div className="relative h-12 w-full mt-2">
              {completedCourses.slice(0, 3).map((course, idx) => (
                <div
                  key={course.id || idx}
                  className="absolute top-0 w-[85%] h-8 bg-white border-2 border-black flex items-center px-2 transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    left: `${idx * 8}%`,
                    top: `${idx * 6}px`,
                    zIndex: 10 - idx,
                    boxShadow: '1px 1px 0px 0px rgba(0,0,0,1)'
                  }}
                >
                  <span className="text-[9px] font-bold truncate text-black leading-none">{course.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSidebarCollapsed && completedCourses.length > 0 && (
          <button
            onClick={() => setIsAllCertModalOpen(true)}
            title="My Certificates"
            className="w-full flex items-center justify-center gap-3 px-0 py-3 text-sm font-bold transition-all duration-150 mb-4 text-black/70 hover:text-black hover:bg-brutal-yellow/30"
          >
            <Award className="w-5 h-5" strokeWidth={2} />
          </button>
        )}

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

      {/* Modals outside main layout flow */}
      <AllCertificatesModal
        open={isAllCertModalOpen}
        onClose={() => setIsAllCertModalOpen(false)}
        onViewCertificate={(course) => setSelectedCert(course)}
      />

      {selectedCert && (
        <UICertificateModal
          open={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          courseName={selectedCert.title}
          userName={user?.fullName || "Student"}
          completionDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          skills={selectedCert.skills || []}
        />
      )}
    </aside>
  );
};
