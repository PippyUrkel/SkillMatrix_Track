import { useState, useEffect } from 'react';
import { HomePage } from '@/features/home';
import { LoginPage } from '@/features/auth/LoginPage';
import { OnboardingWizard } from '@/features/onboarding';
import { DashboardPage } from '@/features/dashboard';
import { SkillGapPage } from '@/features/skillgap';
import { LearningPage } from '@/features/learning';
import { JobsPage } from '@/features/jobs';
import { ProgressPage } from '@/features/progress';
import { SettingsPage } from '@/features/settings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUserStore } from '@/stores/userStore';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { StudyTimer } from '@/components/ui/StudyTimer';
import { OnboardingTooltips } from '@/components/ui/OnboardingTooltips';
import { Spinner } from '@/components/ui/spinner';
import './App.css';

type Page =
  | 'home'
  | 'login'
  | 'onboarding'
  | 'dashboard'
  | 'skill-gap'
  | 'learning'
  | 'jobs'
  | 'ai-helper'
  | 'progress'
  | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isAuthenticated, fetchMe, isLoading, user } = useUserStore();
  useKeyboardShortcuts();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (isAuthenticated && (currentPage === 'home' || currentPage === 'login')) {
      // If user has a target role, they probably finished onboarding
      if (user?.targetRole) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('onboarding');
      }
    }
  }, [isAuthenticated, user, currentPage]);

  const isDashboard = !['home', 'login', 'onboarding'].includes(currentPage);

  // Handle login — called by LoginPage after successful login or signup
  const handleLogin = (isNewUser?: boolean) => {
    // Refresh user state, then decide where to go
    const currentUser = useUserStore.getState().user;
    const hasCompletedOnboarding =
      !!currentUser?.targetRole || localStorage.getItem('onboarding_complete') === 'true';

    if (isNewUser && !hasCompletedOnboarding) {
      setCurrentPage('onboarding');
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Handle navigation
  const navigate = (path: string) => {
    const page = path.replace('/dashboard/', '').replace('/dashboard', 'dashboard') as Page;
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_complete', 'true');
    setCurrentPage('dashboard');
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onGetStarted={() => setCurrentPage('login')} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'onboarding':
        return <OnboardingWizard onComplete={handleOnboardingComplete} />;
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case 'skill-gap':
        return <SkillGapPage onNavigate={navigate} />;
      case 'learning':
        return <LearningPage onNavigate={navigate} />;
      case 'jobs':
        return <JobsPage onNavigate={navigate} />;
      case 'ai-helper':
        return <DashboardPage onNavigate={navigate} />;
      case 'progress':
        return <ProgressPage onNavigate={navigate} />;
      case 'settings':
        return <SettingsPage onNavigate={navigate} />;
      default:
        return <HomePage onGetStarted={() => setCurrentPage('login')} />;
    }
  };

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="w-8 h-8 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      {renderPage()}

      {/* Global Overlays — only on dashboard pages */}
      {isDashboard && (
        <>
          <CommandPalette onNavigate={navigate} />
          <StudyTimer />
          <OnboardingTooltips />
        </>
      )}
    </div>
  );
}

export default App;
