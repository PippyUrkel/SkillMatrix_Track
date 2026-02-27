import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { useDashboardStore, useUserStore } from '@/stores';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, ExternalLink, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillGapPageProps {
  onNavigate: (path: string) => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigate }) => {
  const { skills, marketSkills, evaluateGaps, isLoadingSkills } = useDashboardStore();
  const { user } = useUserStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'gap' | 'category'>('gap');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const targetRole = user?.targetRole || 'Software Developer';

  const handleRerun = async () => {
    await evaluateGaps(targetRole);
    setLastUpdated(new Date());
  };

  // Auto-evaluate on mount if no skills and we have a target role
  React.useEffect(() => {
    if (skills.length === 0 && targetRole) {
      evaluateGaps(targetRole).then(() => setLastUpdated(new Date()));
    }
  }, []);

  const missingSkills = skills.filter((s) => s.gap === 'high');
  const partialSkills = skills.filter((s) => s.gap === 'medium');
  const strongSkills = skills.filter((s) => s.gap === 'none');

  const sortedSkills = [...skills].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    const gapOrder = { high: 0, medium: 1, low: 2, none: 3 };
    return gapOrder[a.gap] - gapOrder[b.gap];
  });

  const getGapColor = (gap: string) => {
    switch (gap) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'accent';
      default:
        return 'success';
    }
  };

  const getTimeAgo = () => {
    if (!lastUpdated) return 'Not run yet';
    const mins = Math.round((Date.now() - lastUpdated.getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.round(mins / 60)}h ago`;
  };

  return (
    <DashboardLayout activeItem="skillgap" onNavigate={onNavigate} title="Skill Gap Analysis">
      {/* Role Selector */}
      <MatrixCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Analyzing for:</p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{targetRole}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-sm">{getTimeAgo()}</p>
            <MatrixButton
              variant="secondary"
              size="sm"
              onClick={handleRerun}
              disabled={isLoadingSkills}
              loading={isLoadingSkills}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoadingSkills && "animate-spin")} />
              {isLoadingSkills ? 'Analyzing...' : 'Re-run Analysis'}
            </MatrixButton>
          </div>
        </div>
      </MatrixCard>

      {/* Three Column Skill Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Missing Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-none bg-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">Missing Skills</h3>
            <MatrixBadge variant="error">{missingSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {missingSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className="w-full p-3 bg-brutal-pink rounded-none border-2 border-black transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mb-3"
              >
                <p className="text-black font-black">{skill.name}</p>
                <p className="text-black font-medium text-sm">{skill.requiredLevel} required</p>
              </button>
            ))}
          </div>
        </MatrixCard>

        {/* Partial Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-none bg-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">Partial Skills</h3>
            <MatrixBadge variant="warning">{partialSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {partialSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className="w-full p-3 bg-brutal-yellow rounded-none border-2 border-black transition-all text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 mb-3"
              >
                <p className="text-black font-black">{skill.name}</p>
                <p className="text-black font-medium text-sm">Current: {skill.currentLevel} / Required: {skill.requiredLevel}</p>
              </button>
            ))}
          </div>
        </MatrixCard>

        {/* Strong Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-none bg-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-900">Strong Skills</h3>
            <MatrixBadge variant="success">{strongSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {strongSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 bg-emerald-400 rounded-none border-2 border-black transition-all mb-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <p className="text-black font-black">{skill.name}</p>
                <p className="text-black font-medium text-sm">{skill.currentLevel}</p>
              </div>
            ))}
          </div>
        </MatrixCard>
      </div>

      {/* Skill Depth Breakdown Table */}
      <MatrixCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Skill Depth Breakdown</h3>
          <div className="flex gap-2">
            {(['gap', 'name', 'category'] as const).map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={cn(
                  'px-3 py-1.5 rounded-none border-2 border-black text-sm capitalize transition-all font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none',
                  sortBy === sort
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-black hover:text-white'
                )}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Skill Name</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Category</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Your Level</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Required</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Gap</th>
                <th className="text-left text-slate-500 text-sm font-medium pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedSkills.map((skill) => (
                <tr key={skill.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 text-slate-900 font-medium">{skill.name}</td>
                  <td className="py-4 text-slate-500">{skill.category}</td>
                  <td className="py-4 text-slate-500 capitalize">{skill.currentLevel}</td>
                  <td className="py-4 text-slate-900 capitalize">{skill.requiredLevel}</td>
                  <td className="py-4">
                    <MatrixBadge variant={getGapColor(skill.gap) as any}>
                      {skill.gap}
                    </MatrixBadge>
                  </td>
                  <td className="py-4">
                    <MatrixButton
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate('/dashboard/learning')}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Learning
                    </MatrixButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MatrixCard>

      {/* Market Demand */}
      <MatrixCard>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">What the Market Wants Right Now</h3>
        <p className="text-slate-500 text-sm mb-6">
          Top in-demand skills for Software Engineer roles
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketSkills} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                stroke="#94A3B8"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #000000',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
                itemStyle={{ color: '#000000', fontWeight: 'bold' }}
              />
              <Bar dataKey="demandScore" fill="#FFDE59" stroke="#000000" strokeWidth={2} radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-slate-400 text-xs mt-4">
          Source: Real-time data scraped from LinkedIn, Indeed, Glassdoor — updated daily.
        </p>
      </MatrixCard>

      {/* Skill Drawer (Modal) */}
      {selectedSkill && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="w-full max-w-md bg-white border-l-4 border-black h-full p-6 overflow-auto shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-right-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {skills.find((s) => s.id === selectedSkill)?.name}
              </h3>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-slate-400 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 mb-6">
              Recommended courses to master this skill:
            </p>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => {
                const colors = ['bg-brutal-pink', 'bg-brutal-blue', 'bg-brutal-yellow'];
                const cardColor = colors[i - 1];
                return (
                  <div
                    key={i}
                    className={`p-4 ${cardColor} rounded-none border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1`}
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-14 bg-black/10 rounded-none border-2 border-black flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-black font-black mb-1">
                          {selectedSkill === '1'
                            ? 'System Design Fundamentals'
                            : selectedSkill === '2'
                              ? 'API Security Best Practices'
                              : 'Advanced Course'}{' '}
                          Part {i}
                        </h4>
                        <p className="text-black font-medium text-sm mb-2">Tech Academy</p>
                        <div className="flex items-center gap-2">
                          <MatrixBadge variant="accent" size="sm">
                            AI Score: {90 + i * 2}%
                          </MatrixBadge>
                          <span className="text-black font-bold text-xs">• {2 + i}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <MatrixButton
              variant="secondary"
              size="sm"
              className="w-full mt-3"
              onClick={() => onNavigate('/dashboard/learning')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Add to Learning Path
            </MatrixButton>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SkillGapPage;
