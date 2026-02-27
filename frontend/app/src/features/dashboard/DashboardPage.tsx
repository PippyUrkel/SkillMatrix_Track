import React from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { useUserStore, useDashboardStore } from '@/stores';
import {
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Zap, PlayCircle, Briefcase, TrendingUp, ChevronRight, Sparkles, Target } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useUserStore();
  const { skillCategories, courses, jobs, activities } = useDashboardStore();

  const stats = [
    {
      label: 'Course Progress',
      value: '65%',
      subtext: 'System Design Interviews',
      icon: PlayCircle,
      trend: '+12% this week',
      color: 'bg-blue-500',
    },
    {
      label: 'Skills Mastered',
      value: '14',
      subtext: 'out of 22 total',
      icon: Zap,
      progress: 64,
      color: 'bg-emerald-500',
    },
    {
      label: 'Day Streak',
      value: '12',
      subtext: 'days in a row',
      icon: TrendingUp,
      trend: 'Keep it up!',
      color: 'bg-orange-500',
    },
    {
      label: 'Job Matches',
      value: '47',
      subtext: 'opportunities',
      icon: Briefcase,
      trend: '5 new today',
      color: 'bg-purple-500',
    },
  ];

  const skillData = skillCategories.map((cat) => ({
    subject: cat.name,
    A: cat.currentScore,
    B: cat.requiredScore,
    fullMark: 100,
  }));

  const sparklineData = [
    { value: 45 },
    { value: 52 },
    { value: 48 },
    { value: 58 },
    { value: 65 },
    { value: 72 },
  ];

  return (
    <DashboardLayout activeItem="dashboard" onNavigate={onNavigate} title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Welcome back, {user?.fullName.split(' ')[0]}!
            </h2>
            <p className="text-emerald-100">You're making great progress on your learning journey</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-emerald-100">Current Level</p>
              <p className="text-2xl font-bold">{user?.level}</p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <MatrixCard key={index} className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-slate-500 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-slate-400 text-xs mt-1">{stat.subtext}</p>
              </div>
              <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>

            {stat.progress && (
              <MatrixProgress value={stat.progress} size="sm" />
            )}

            {stat.trend && (
              <div className="flex items-center gap-1 mt-2">
                <MatrixBadge variant="success" size="sm">
                  {stat.trend}
                </MatrixBadge>
              </div>
            )}

            {index === 0 && (
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </MatrixCard>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Skill Radar */}
        <MatrixCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Your Skills</h3>
              <p className="text-slate-500 text-sm">Current vs Required proficiency</p>
            </div>
            <MatrixButton
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('/dashboard/skill-gap')}
            >
              View Details
            </MatrixButton>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Required"
                  dataKey="B"
                  stroke="#64748B"
                  fill="#64748B"
                  fillOpacity={0.1}
                  strokeDasharray="4 4"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#0F172A' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </MatrixCard>

        {/* AI Career Matches */}
        <MatrixCard className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Job Matches</h3>
          <p className="text-slate-500 text-sm mb-4">Based on your skills</p>
          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-300 transition-colors cursor-pointer"
                onClick={() => onNavigate('/dashboard/jobs')}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-slate-900 font-medium">{job.title}</h4>
                  <MatrixBadge
                    variant={job.fitScore >= 90 ? 'success' : job.fitScore >= 80 ? 'accent' : 'warning'}
                  >
                    {job.fitScore}% fit
                  </MatrixBadge>
                </div>
                <p className="text-slate-500 text-sm mb-2">{job.company}</p>
                <div className="flex flex-wrap gap-1">
                  {job.missingSkills.slice(0, 2).map((skill) => (
                    <span key={skill} className="text-xs text-slate-400">
                      • {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <MatrixButton
            variant="ghost"
            size="sm"
            className="w-full mt-4"
            onClick={() => onNavigate('/dashboard/jobs')}
          >
            View All Jobs
            <ChevronRight className="w-4 h-4 ml-1" />
          </MatrixButton>
        </MatrixCard>
      </div>

      {/* Continue Learning */}
      <MatrixCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Continue Learning</h3>
            <p className="text-slate-500 text-sm">Pick up where you left off</p>
          </div>
          <MatrixButton
            variant="secondary"
            size="sm"
            onClick={() => onNavigate('/dashboard/learning')}
          >
            View All Courses
          </MatrixButton>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="min-w-[280px] bg-slate-50 rounded-xl border border-slate-100 overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer"
              onClick={() => onNavigate('/dashboard/learning')}
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-32 object-cover"
              />
              <div className="p-4">
                <h4 className="text-slate-900 font-medium mb-1 line-clamp-1">{course.title}</h4>
                <p className="text-slate-500 text-sm mb-3">{course.channel}</p>
                <MatrixProgress value={course.progress} showLabel />
              </div>
            </div>
          ))}
        </div>
      </MatrixCard>

      {/* Recent Activity */}
      <MatrixCard>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Course</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Action</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Skill Gained</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 text-slate-900">{activity.course}</td>
                  <td className="py-4 text-slate-500">{activity.action}</td>
                  <td className="py-4">
                    <MatrixBadge variant="accent">{activity.skillGained}</MatrixBadge>
                  </td>
                  <td className="py-4 text-slate-400">
                    {activity.date.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MatrixCard>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mt-8">
        <MatrixButton onClick={() => onNavigate('/dashboard/learning')}>
          <Sparkles className="w-4 h-4 mr-2" />
          Continue Learning
        </MatrixButton>
        <MatrixButton variant="secondary" onClick={() => onNavigate('/dashboard/jobs')}>
          <Briefcase className="w-4 h-4 mr-2" />
          Browse Jobs
        </MatrixButton>
        <MatrixButton variant="ghost" onClick={() => onNavigate('/dashboard/progress')}>
          <TrendingUp className="w-4 h-4 mr-2" />
          View Progress
        </MatrixButton>
      </div>
    </DashboardLayout>
  );
};
