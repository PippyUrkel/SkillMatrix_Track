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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative floating blocks */}
      <div className="absolute top-16 right-[12%] w-20 h-20 bg-brutal-pink border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12 hidden lg:block" />
      <div className="absolute bottom-24 left-[8%] w-16 h-16 bg-brutal-blue border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] -rotate-6 hidden lg:block" />
      <div className="absolute top-[30%] left-[5%] w-12 h-12 bg-brutal-orange border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-45 hidden lg:block" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brutal-yellow border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4">
            <Sparkles className="w-8 h-8 text-black" strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-black mb-2 tracking-tight">SkillMatrix</h1>
          <p className="text-black/60 font-bold">AI-powered career guidance</p>
        </div>

        <MatrixCard>
          <h2 className="text-xl font-black text-black mb-1 uppercase">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-black/50 text-sm font-medium mb-6">
            {isLogin ? 'Sign in to continue your learning journey' : 'Start your personalized career path'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-4 pr-4 py-3 bg-white border-2 border-black text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,222,89,1)] transition-all font-medium"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,222,89,1)] transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-black mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-white border-2 border-black text-black placeholder:text-black/30 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,222,89,1)] transition-all font-medium"
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
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
            </MatrixButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-black/60 font-bold uppercase text-xs tracking-wider">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-white hover:bg-brutal-yellow shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Github className="w-5 h-5 text-black" strokeWidth={2.5} />
              <span className="text-sm font-black text-black">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-white hover:bg-brutal-blue shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Linkedin className="w-5 h-5 text-black" strokeWidth={2.5} />
              <span className="text-sm font-black text-black">LinkedIn</span>
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-black/60 font-medium mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-black font-black hover:bg-brutal-blue px-2 py-0.5 border-2 border-transparent hover:border-black transition-all"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </MatrixCard>

        {/* Footer */}
        <p className="text-center text-xs text-black/40 font-bold mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
