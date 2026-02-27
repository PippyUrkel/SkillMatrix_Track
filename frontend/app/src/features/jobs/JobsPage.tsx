import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { useDashboardStore } from '@/stores';
import { cn } from '@/lib/utils';
import {
  Search,
  MapPin,
  Heart,
  ExternalLink,
  FileText,
  Copy,
  Download,
  X,
  Building2,
} from 'lucide-react';

interface JobsPageProps {
  onNavigate: (path: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({ onNavigate }) => {
  const { jobs, savedJobs, saveJob, unsaveJob } = useDashboardStore();
  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [showApplyPanel, setShowApplyPanel] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    location: '',
    remote: false,
    experience: '',
    minFit: 50,
    source: 'all',
  });

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'saved' && !savedJobs.includes(job.id)) return false;
    if (filters.role && !job.title.toLowerCase().includes(filters.role.toLowerCase())) return false;
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.remote && job.type !== 'remote') return false;
    if (job.fitScore < filters.minFit) return false;
    return true;
  });

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      unsaveJob(jobId);
    } else {
      saveJob(jobId);
    }
  };

  const copyCoverLetter = () => {
    navigator.clipboard.writeText(generateCoverLetter());
  };

  const generateCoverLetter = () => {
    return `Dear Hiring Manager,

I am excited to apply for the ${selectedJob.title} position at ${selectedJob.company}. With my skills in ${selectedJob.matchedSkills.join(', ')}, I am confident in my ability to contribute effectively to your team.

My experience aligns well with the requirements of this role, and I am particularly drawn to ${selectedJob.company}'s innovative approach to technology.

I would welcome the opportunity to discuss how my background and skills would be a great fit for this position.

Best regards,
[Your Name]`;
  };

  return (
    <DashboardLayout activeItem="jobs" onNavigate={onNavigate} title="Job Matching">
      {/* Filter Bar */}
      <MatrixCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Role..."
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.remote}
              onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
              className="w-4 h-4 accent-emerald-500"
            />
            Remote only
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-sm">Min Fit:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minFit}
              onChange={(e) => setFilters({ ...filters, minFit: parseInt(e.target.value) })}
              className="w-24 accent-emerald-500"
            />
            <span className="text-slate-900 text-sm">{filters.minFit}%</span>
          </div>

          <MatrixBadge variant="accent">{filteredJobs.length} jobs found</MatrixBadge>
        </div>
      </MatrixCard>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'all'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          All Jobs
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            activeTab === 'saved'
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          Saved ({savedJobs.length})
        </button>
      </div>

      {/* Job List + Detail Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Job List */}
        <div className="lg:col-span-2 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={cn(
                'p-4 rounded-xl border cursor-pointer transition-all',
                selectedJob.id === job.id
                  ? 'bg-emerald-50 border-emerald-500'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveJob(job.id);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Heart
                    className={cn(
                      'w-5 h-5',
                      savedJobs.includes(job.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-slate-400'
                    )}
                  />
                </button>
              </div>

              <h4 className="text-slate-900 font-semibold mb-1">{job.title}</h4>
              <p className="text-slate-500 text-sm mb-2">{job.company}</p>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>

              <div className="flex items-center justify-between">
                <MatrixBadge
                  variant={job.fitScore >= 90 ? 'success' : job.fitScore >= 80 ? 'accent' : 'warning'}
                >
                  {job.fitScore}% fit
                </MatrixBadge>
                <div className="flex gap-1">
                  {job.matchedSkills.slice(0, 2).map((skill) => (
                    <span key={skill} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Job Detail */}
        <MatrixCard className="lg:col-span-3">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedJob.title}</h2>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {selectedJob.company}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </span>
              </div>
            </div>
            <MatrixBadge
              variant={selectedJob.fitScore >= 90 ? 'success' : selectedJob.fitScore >= 80 ? 'accent' : 'warning'}
              size="md"
            >
              {selectedJob.fitScore}% fit
            </MatrixBadge>
          </div>

          <div className="mb-6">
            <h4 className="text-slate-900 font-semibold mb-2">Job Description</h4>
            <p className="text-slate-600">{selectedJob.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-emerald-600 font-semibold mb-3">Skills You Have</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.matchedSkills.map((skill) => (
                  <MatrixBadge key={skill} variant="success">
                    {skill}
                  </MatrixBadge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-red-500 font-semibold mb-3">Skills You Need</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.missingSkills.map((skill) => (
                  <span key={skill} className="flex items-center gap-1">
                    <MatrixBadge variant="error">{skill}</MatrixBadge>
                    <button
                      onClick={() => onNavigate('/dashboard/learning')}
                      className="text-emerald-600 text-xs hover:underline"
                    >
                      Learn
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <MatrixButton variant="secondary" onClick={() => setShowCoverLetter(true)}>
              <FileText className="w-4 h-4 mr-2" />
              AI Cover Letter
            </MatrixButton>
            <MatrixButton onClick={() => setShowApplyPanel(true)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
            </MatrixButton>
          </div>
        </MatrixCard>
      </div>

      {/* Cover Letter Modal */}
      {showCoverLetter && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCoverLetter(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">AI Cover Letter</h3>
              <button onClick={() => setShowCoverLetter(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                defaultValue={generateCoverLetter()}
                className="w-full h-64 bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl resize-none focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-3 mt-4">
                <MatrixButton variant="secondary" onClick={copyCoverLetter}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </MatrixButton>
                <MatrixButton variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download as .docx
                </MatrixButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply Panel */}
      {showApplyPanel && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setShowApplyPanel(false)}
        >
          <div
            className="w-full max-w-lg bg-white border-l border-slate-200 h-full overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Tailored Application</h3>
              <button onClick={() => setShowApplyPanel(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-slate-900 font-semibold mb-3">Resume Highlights</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm">Auto-extracted from your profile:</p>
                  <ul className="mt-2 space-y-1">
                    {selectedJob.matchedSkills.map((skill) => (
                      <li key={skill} className="text-emerald-600 text-sm flex items-center gap-2">
                        <CheckIcon /> {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-slate-900 font-semibold mb-3">Suggested Edits</h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm mb-2">Add these skills to your resume:</p>
                  <div className="space-y-2">
                    {selectedJob.missingSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-500">+</span>
                        <span className="text-slate-900">{skill}</span>
                        <span className="text-slate-400">(in progress)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <MatrixButton
                className="w-full"
                onClick={() => window.open(`https://linkedin.com/jobs`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Submit Application
              </MatrixButton>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
