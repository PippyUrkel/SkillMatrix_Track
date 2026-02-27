import React, { useState } from 'react';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { Sparkles, Mail, Lock, ArrowRight, Github, Linkedin } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface LoginPageProps {
  onLogin: (isNewUser?: boolean) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { login, signup, isLoading } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        await login({ email, password });
        onLogin(false); // Returning user — skip onboarding
      } else {
        await signup({ email, password, name: fullName });
        onLogin(true); // Brand new user — show onboarding
      }
    } catch (error: any) {
      alert(error.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-none shadow-lg shadow-emerald-200 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SkillMatrix</h1>
          <p className="text-slate-500">AI-powered career guidance</p>
        </div>

        <MatrixCard>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {isLogin ? 'Sign in to continue your learning journey' : 'Start your personalized career path'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-4 pr-4 py-3 bg-white border border-slate-200 rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  required
                />
              </div>
            </div>

            <MatrixButton
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </MatrixButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-none hover:bg-slate-50 transition-colors">
              <Github className="w-5 h-5 text-slate-700" />
              <span className="text-sm font-medium text-slate-700">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-none hover:bg-slate-50 transition-colors">
              <Linkedin className="w-5 h-5 text-[#0077B5]" />
              <span className="text-sm font-medium text-slate-700">LinkedIn</span>
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 font-medium hover:text-emerald-700"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </MatrixCard>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
