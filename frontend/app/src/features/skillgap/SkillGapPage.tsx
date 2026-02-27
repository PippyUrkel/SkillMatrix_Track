import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { useDashboardStore } from '@/stores';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, ChevronDown, ExternalLink, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillGapPageProps {
  onNavigate: (path: string) => void;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigate }) => {
  const { skills, marketSkills } = useDashboardStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'gap' | 'category'>('gap');

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

  return (
    <DashboardLayout activeItem="skillgap" onNavigate={onNavigate} title="Skill Gap Analysis">
      {/* Role Selector */}
      <MatrixCard className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-1">Analyzing for:</p>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">Software Engineer</h2>
              <button className="text-emerald-600 hover:underline text-sm flex items-center gap-1">
                Change <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-400 text-sm">Analysis updated 2 hours ago</p>
            <MatrixButton variant="secondary" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-run Analysis
            </MatrixButton>
          </div>
        </div>
      </MatrixCard>

      {/* Three Column Skill Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Missing Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <h3 className="text-lg font-semibold text-slate-900">Missing Skills</h3>
            <MatrixBadge variant="error">{missingSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {missingSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-red-400 transition-colors text-left"
              >
                <p className="text-slate-900 font-medium">{skill.name}</p>
                <p className="text-red-500 text-sm">{skill.requiredLevel} required</p>
              </button>
            ))}
          </div>
        </MatrixCard>

        {/* Partial Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <h3 className="text-lg font-semibold text-slate-900">Partial Skills</h3>
            <MatrixBadge variant="warning">{partialSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {partialSkills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkill(skill.id)}
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-400 transition-colors text-left"
              >
                <p className="text-slate-900 font-medium">{skill.name}</p>
                <p className="text-orange-500 text-sm">
                  You: {skill.currentLevel} → Need: {skill.requiredLevel}
                </p>
              </button>
            ))}
          </div>
        </MatrixCard>

        {/* Strong Skills */}
        <MatrixCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-900">Strong Skills</h3>
            <MatrixBadge variant="success">{strongSkills.length}</MatrixBadge>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {strongSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <p className="text-slate-900 font-medium">{skill.name}</p>
                <p className="text-emerald-600 text-sm">{skill.currentLevel}</p>
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
                  'px-3 py-1.5 rounded-lg text-sm capitalize transition-colors',
                  sortBy === sort
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                stroke="#64748B"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#0F172A' }}
              />
              <Bar dataKey="demandScore" fill="#10B981" radius={[0, 4, 4, 0]} />
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
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setSelectedSkill(null)}
        >
          <div
            className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {skills.find((s) => s.id === selectedSkill)?.name}
              </h3>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500 mb-6">
              Recommended courses to master this skill:
            </p>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="w-20 h-14 bg-slate-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-slate-900 font-medium mb-1">
                        {selectedSkill === '1'
                          ? 'System Design Fundamentals'
                          : selectedSkill === '2'
                          ? 'API Security Best Practices'
                          : 'Advanced Course'}{' '}
                        Part {i}
                      </h4>
                      <p className="text-slate-500 text-sm mb-2">Tech Academy</p>
                      <div className="flex items-center gap-2">
                        <MatrixBadge variant="accent" size="sm">
                          AI Score: {90 + i * 2}%
                        </MatrixBadge>
                        <span className="text-slate-400 text-xs">• {2 + i}h</span>
                      </div>
                    </div>
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
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
