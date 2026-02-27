import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
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
  Lock,
  Star,
  Zap,
  Trophy,
  Linkedin,
  TrendingUp,
  CheckCircle,
  GraduationCap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface ProgressPageProps {
  onNavigate: (path: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const { user, shareLinkedInPost } = useUserStore();
  const { courses, skills } = useDashboardStore();
  const [linkedInPost, setLinkedInPost] = useState('');

  // ── Compute real stats from store ─────────────────────────────────────────
  const completedCourses = useMemo(
    () => courses.filter((c) => c.status === 'completed' || c.progress === 100),
    [courses]
  );
  const totalLessonsCompleted = useMemo(
    () =>
      courses.reduce(
        (sum, c) =>
          sum + c.modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0),
        0
      ),
    [courses]
  );
  const strongSkills = useMemo(() => skills.filter((s) => s.gap === 'none'), [skills]);
  const totalCourseProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    return Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length);
  }, [courses]);

  // XP: 20 per lesson + 150 per completed course (mirrors the LearningPage actions)
  const computedXP = useMemo(
    () => totalLessonsCompleted * 20 + completedCourses.length * 150,
    [totalLessonsCompleted, completedCourses]
  );
  const xp = user?.xp || computedXP;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpProgress = (xpInLevel / 500) * 100;

  const stats = [
    {
      label: 'Courses Completed',
      value: completedCourses.length,
      icon: BookOpen,
      color: '#000000',
      bg: '#5CE1E6', // brutal-blue
    },
    {
      label: 'Skills Unlocked',
      value: strongSkills.length || skills.length,
      icon: Star,
      color: '#000000',
      bg: '#FFDE59', // brutal-yellow
    },
    {
      label: 'Day Streak',
      value: user?.streak || 0,
      icon: Flame,
      color: '#000000',
      bg: '#FF914D', // brutal-orange
    },
    {
      label: 'Lessons Done',
      value: totalLessonsCompleted,
      icon: CheckCircle,
      color: '#000000',
      bg: '#FF66C4', // brutal-pink
    },
  ];

  // ── Progress chart: one point per course showing its % ────────────────────
  const progressData = useMemo(() => {
    if (courses.length === 0) return [];
    return courses.map((c, i) => ({
      week: c.title.length > 12 ? c.title.slice(0, 10) + '…' : c.title,
      overallScore: c.progress,
      targetRoleMatch: Math.min(100, c.progress + 15),
    }));
  }, [courses]);

  // ── Achievements (dynamic, based on real milestones) ──────────────────────
  const achievements = useMemo(() => {
    const list = [
      {
        id: 'first_lesson',
        name: 'First Step',
        description: 'Complete your first lesson',
        icon: '🎯',
        locked: totalLessonsCompleted < 1,
        dateEarned: totalLessonsCompleted >= 1 ? new Date() : undefined,
      },
      {
        id: 'five_lessons',
        name: 'Getting Started',
        description: 'Complete 5 lessons',
        icon: '📚',
        locked: totalLessonsCompleted < 5,
        dateEarned: totalLessonsCompleted >= 5 ? new Date() : undefined,
      },
      {
        id: 'first_course',
        name: 'Course Champion',
        description: 'Complete your first course',
        icon: '🏆',
        locked: completedCourses.length < 1,
        dateEarned: completedCourses.length >= 1 ? new Date() : undefined,
      },
      {
        id: 'three_courses',
        name: 'Stacked Learner',
        description: 'Complete 3 courses',
        icon: '🎓',
        locked: completedCourses.length < 3,
        dateEarned: completedCourses.length >= 3 ? new Date() : undefined,
      },
      {
        id: 'skill_evaluator',
        name: 'Skill Evaluator',
        description: 'Run your first skill gap analysis',
        icon: '🔍',
        locked: skills.length < 1,
        dateEarned: skills.length >= 1 ? new Date() : undefined,
      },
      {
        id: 'strong_skills',
        name: 'Solid Foundation',
        description: 'Have 3 strong skills',
        icon: '💪',
        locked: strongSkills.length < 3,
        dateEarned: strongSkills.length >= 3 ? new Date() : undefined,
      },
      {
        id: 'xp_500',
        name: 'Level Up!',
        description: 'Reach 500 XP',
        icon: '⚡',
        locked: xp < 500,
        dateEarned: xp >= 500 ? new Date() : undefined,
      },
      {
        id: 'xp_1000',
        name: 'Power User',
        description: 'Reach 1000 XP',
        icon: '🌟',
        locked: xp < 1000,
        dateEarned: xp >= 1000 ? new Date() : undefined,
      },
    ];
    // Unlocked first
    return [...list.filter((a) => !a.locked), ...list.filter((a) => a.locked)];
  }, [totalLessonsCompleted, completedCourses, skills, strongSkills, xp]);

  const handleAchievementClick = (achievement: (typeof achievements)[0]) => {
    if (!achievement.locked) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    }
  };

  const generateLinkedInPost = () => {
    const role = user?.targetRole || 'Software Engineering';
    return `I just completed ${completedCourses.length} course${completedCourses.length !== 1 ? 's' : ''} on SkillMatrix and earned ${xp} XP on my journey to becoming a ${role}! 🚀

The AI-powered skill gap analysis + curated learning paths made it crystal clear what I needed to focus on.

Lessons: ${totalLessonsCompleted} ✅ | Skills: ${skills.length} 🧠

#SkillMatrix #CareerGrowth #ContinuousLearning #TechSkills`;
  };

  const handlePostToLinkedIn = () => {
    shareLinkedInPost();
    alert('Posted to LinkedIn successfully!');
  };

  const levelTitle = (lv: number) => {
    if (lv < 2) return 'Skill Builder';
    if (lv < 4) return 'Rising Talent';
    if (lv < 7) return 'Skill Crafter';
    if (lv < 10) return 'Domain Expert';
    return 'Master';
  };

  const unlockedCount = achievements.filter((a) => !a.locked).length;

  return (
    <DashboardLayout activeItem="progress" onNavigate={onNavigate} title="Progress & Achievements">

      {/* XP and Level Banner */}
      <MatrixCard className="mb-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar and Info */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-none bg-brutal-pink border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-black text-2xl font-black">
                {(user?.fullName || 'U').split(' ').map((n) => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.fullName}</h2>
              <p className="text-slate-500">Level {level} — {levelTitle(level)}</p>
              <p className="text-emerald-600 font-semibold">{xp.toLocaleString()} XP</p>
            </div>
          </div>

          {/* XP Ring */}
          <div className="flex-1 flex items-center justify-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#000000" strokeWidth="12" />
                <circle
                  cx="64" cy="64" r="56" fill="none"
                  stroke="#FF66C4" strokeWidth="12" strokeLinecap="square"
                  strokeDasharray={`${(xpProgress / 100) * 351.86} 351.86`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{Math.round(xpProgress)}%</span>
                <span className="text-xs text-slate-500">to Lvl {level + 1}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 text-sm">{500 - xpInLevel} XP to next level</p>
              <MatrixProgress value={xpProgress} className="w-40" showLabel size="sm" />
              <p className="text-xs text-slate-400">
                {unlockedCount}/{achievements.length} achievements unlocked
              </p>
            </div>
          </div>

          {/* Overall course progress */}
          {courses.length > 0 && (
            <div className="flex flex-col items-center gap-2 px-6 border-l border-slate-100">
              <div className="text-3xl font-bold text-slateald-900">{totalCourseProgress}%</div>
              <p className="text-slate-500 text-sm text-center">Avg course<br />progress</p>
              <MatrixProgress value={totalCourseProgress} className="w-24" size="sm" />
            </div>
          )}
        </div>
      </MatrixCard>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <MatrixCard key={stat.label} className="text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <div
              className="w-12 h-12 rounded-none border-2 border-black flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              style={{ backgroundColor: stat.bg }}
            >
              <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
            <p className="text-slate-500 text-sm">{stat.label}</p>
          </MatrixCard>
        ))}
      </div>

      {/* Course Progress Chart */}
      <MatrixCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Course Progress</h3>
          {courses.length > 0 && (
            <span className="text-xs text-slate-400">{courses.length} course{courses.length !== 1 ? 's' : ''} in library</span>
          )}
        </div>
        {progressData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="week" stroke="#94A3B8" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#94A3B8" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', borderRadius: '0px', boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' }}
                  itemStyle={{ color: '#000', fontWeight: 'bold' }}
                  formatter={(v: number) => [`${v}%`]}
                />
                <Line type="monotone" dataKey="overallScore" stroke="#00BF63" strokeWidth={3} dot={{ r: 4, fill: '#00BF63', stroke: '#000', strokeWidth: 2 }} name="Progress" />
                <Line type="monotone" dataKey="targetRoleMatch" stroke="#CB6CE6" strokeWidth={3} strokeDasharray="4 4" dot={false} name="Target Match" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-none flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold text-sm">No courses yet</p>
              <p className="text-slate-400 text-xs">Generate a course to start tracking progress</p>
            </div>
            <button
              onClick={() => onNavigate('/dashboard/learning')}
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Go to Learning →
            </button>
          </div>
        )}
      </MatrixCard>

      {/* Achievements Grid */}
      <MatrixCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Achievements</h3>
          <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-none">
            {unlockedCount} / {achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              onClick={() => handleAchievementClick(achievement)}
              className={cn(
                'p-4 rounded-none border text-center transition-all cursor-pointer',
                achievement.locked
                  ? 'bg-slate-50 border-slate-200 opacity-50'
                  : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200 hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5'
              )}
            >
              <div className="relative w-16 h-16 mx-auto mb-3">
                <div className="text-4xl leading-none flex items-center justify-center w-full h-full">
                  {achievement.icon}
                </div>
                {achievement.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </div>
              <h4 className={cn('font-semibold mb-1 text-sm', achievement.locked ? 'text-slate-400' : 'text-slate-900')}>
                {achievement.name}
              </h4>
              <p className="text-slate-500 text-xs leading-snug">{achievement.description}</p>
              {!achievement.locked && (
                <p className="text-emerald-500 text-xs mt-2 font-medium flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Unlocked
                </p>
              )}
            </div>
          ))}
        </div>
      </MatrixCard>

      {/* LinkedIn Share */}
      <MatrixCard>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Share Your Progress</h3>
        <p className="text-slate-500 text-sm mb-4">Celebrate your achievements and inspire others!</p>
        <textarea
          value={linkedInPost || generateLinkedInPost()}
          onChange={(e) => setLinkedInPost(e.target.value)}
          className="w-full h-32 bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-none resize-none focus:outline-none focus:border-emerald-500 mb-4 text-sm"
        />
        <MatrixButton onClick={handlePostToLinkedIn}>
          <Linkedin className="w-4 h-4 mr-2" />
          Post to LinkedIn
        </MatrixButton>
      </MatrixCard>
    </DashboardLayout>
  );
};

export default ProgressPage;
