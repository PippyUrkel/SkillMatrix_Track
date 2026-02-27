import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { useUserStore, useDashboardStore } from '@/stores';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Flame,
  BookOpen,
  Share2,
  Linkedin,
  Lock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressPageProps {
  onNavigate: (path: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const { user, shareLinkedInPost } = useUserStore();
  const { achievements, progressData } = useDashboardStore();
  const [linkedInPost, setLinkedInPost] = useState('');

  const xpToNextLevel = user ? (user.level * 500) - user.xp : 0;
  const xpProgress = user ? ((user.xp % 500) / 500) * 100 : 0;

  const stats = [
    {
      label: 'Courses Completed',
      value: user?.coursesCompleted || 0,
      icon: BookOpen,
      color: '#10B981',
    },
    {
      label: 'Skills Unlocked',
      value: user?.skillsUnlocked || 0,
      icon: Star,
      color: '#F59E0B',
    },
    {
      label: 'Day Streak',
      value: user?.streak || 0,
      icon: Flame,
      color: '#EF4444',
    },
    {
      label: 'LinkedIn Posts',
      value: user?.linkedInPostsShared || 0,
      icon: Share2,
      color: '#0077B5',
    },
  ];

  const generateLinkedInPost = () => {
    const courses = user?.coursesCompleted || 0;
    const role = user?.targetRole || 'Software Engineer';
    const oldScore = 40;
    const newScore = 72;
    return `I just completed ${courses} courses on SkillMatrix and improved my ${role} readiness from ${oldScore}% to ${newScore}%! 🚀

The AI-powered skill gap analysis helped me focus on exactly what I needed to learn. No more random tutorials—just a clear path to my goal.

#SkillMatrix #CareerGrowth #ContinuousLearning #TechSkills`;
  };

  const handlePostToLinkedIn = () => {
    shareLinkedInPost();
    alert('Posted to LinkedIn successfully!');
  };

  return (
    <DashboardLayout activeItem="progress" onNavigate={onNavigate} title="Progress & Achievements">
      {/* XP and Level Banner */}
      <MatrixCard className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar and Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.fullName.split(' ').map((n) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
              <p className="text-slate-500">Level {user?.level} — Skill Builder</p>
              <p className="text-emerald-600 font-semibold">{user?.xp.toLocaleString()} XP</p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(xpProgress / 100) * 351.86} 351.86`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{Math.round(xpProgress)}%</span>
                <span className="text-xs text-slate-500">to Level {user ? user.level + 1 : 1}</span>
              </div>
            </div>
            <div className="ml-6">
              <p className="text-slate-500 text-sm">{xpToNextLevel} XP needed</p>
            </div>
          </div>
        </div>
      </MatrixCard>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <MatrixCard key={stat.label} className="text-center">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${stat.color}20` }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </MatrixCard>
        ))}
      </div>

      {/* Skill Timeline */}
      <MatrixCard className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Score Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#0F172A' }}
              />
              <Line
                type="monotone"
                dataKey="overallScore"
                stroke="#10B981"
                strokeWidth={2}
                name="Overall Score"
              />
              <Line
                type="monotone"
                dataKey="targetRoleMatch"
                stroke="#64748B"
                strokeWidth={2}
                strokeDasharray="4 4"
                name="Target Role Match"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </MatrixCard>

      {/* Achievements Grid */}
      <MatrixCard className="mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                'p-4 rounded-xl border text-center transition-all',
                achievement.locked
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-emerald-50 border-emerald-200'
              )}
            >
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="text-4xl">{achievement.icon}</div>
                {achievement.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-full">
                    <Lock className="w-6 h-6 text-slate-400" />
                  </div>
                )}
              </div>
              <h4 className={cn(
                'font-semibold mb-1',
                achievement.locked ? 'text-slate-400' : 'text-slate-900'
              )}>
                {achievement.name}
              </h4>
              <p className="text-slate-500 text-xs">{achievement.description}</p>
              {achievement.dateEarned && (
                <p className="text-emerald-600 text-xs mt-2">
                  Earned {achievement.dateEarned.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </MatrixCard>

      {/* LinkedIn Share Section */}
      <MatrixCard>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Progress</h3>
        <p className="text-slate-500 text-sm mb-4">
          Celebrate your achievements and inspire others!
        </p>
        <textarea
          value={linkedInPost || generateLinkedInPost()}
          onChange={(e) => setLinkedInPost(e.target.value)}
          className="w-full h-32 bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl resize-none focus:outline-none focus:border-emerald-500 mb-4"
        />
        <MatrixButton onClick={handlePostToLinkedIn}>
          <Linkedin className="w-4 h-4 mr-2" />
          Post to LinkedIn
        </MatrixButton>

        {/* Past Posts */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-slate-900 font-medium mb-3">Recent Posts</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-slate-900 text-sm">Completed "System Design Interviews"</p>
                <p className="text-slate-400 text-xs">Feb 20, 2024</p>
              </div>
              <div className="flex gap-3 text-slate-400 text-sm">
                <span>24 likes</span>
                <span>3 comments</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-slate-900 text-sm">Reached Level 7 — Skill Builder</p>
                <p className="text-slate-400 text-xs">Feb 15, 2024</p>
              </div>
              <div className="flex gap-3 text-slate-400 text-sm">
                <span>42 likes</span>
                <span>8 comments</span>
              </div>
            </div>
          </div>
        </div>
      </MatrixCard>
    </DashboardLayout>
  );
};
