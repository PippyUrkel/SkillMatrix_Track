import React, { useRef, useState } from 'react';
import { useOnboardingStore } from '@/stores';
import { Github, Linkedin, Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { extractTextFromPDF } from '@/lib/pdfExtract';

export const ProfileSetupStep: React.FC = () => {
  const {
    resume,
    setResume,
    githubConnected,
    linkedInConnected,
    connectLinkedIn,
    githubUsername,
    setGithubUsername,
    analyzeGitHub,
    analyzeResume,
    isLoadingAnalysis,
    analysisError,
    analysisResult,
    targetRole,
    setTargetRole,
  } = useOnboardingStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localUsername, setLocalUsername] = useState(githubUsername);
  const [resumeAnalyzed, setResumeAnalyzed] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResume(file);
      try {
        let text: string;
        if (file.name.toLowerCase().endsWith('.pdf')) {
          text = await extractTextFromPDF(file);
        } else {
          text = await file.text();
        }
        if (text.trim().length >= 10) {
          await analyzeResume(text, targetRole);
          setResumeAnalyzed(true);
        }
      } catch (err) {
        console.error('Resume analysis failed:', err);
      }
    }
  };

  const clearResume = () => {
    setResume(null);
    setResumeAnalyzed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGitHubConnect = async () => {
    if (!localUsername.trim()) return;
    setGithubUsername(localUsername.trim());
    try {
      await analyzeGitHub(localUsername.trim(), targetRole);
    } catch {
      // Error is captured in store.analysisError
    }
  };

  const isCodingRole = /developer|engineer|programmer|coder|software|frontend|backend|fullstack|devops|data scientist/i.test(targetRole);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Profiles</h2>
        <p className="text-slate-500">
          Enter your target role and GitHub username to analyze your skills
        </p>
      </div>

      {/* Target Role Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">What role are you targeting?</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Frontend Developer, Data Scientist, DevOps Engineer"
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
        />
      </div>

      {/* GitHub Connection — Primary Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          GitHub Profile {isCodingRole ? <span className="text-red-500">*Required for Coding Roles</span> : <span className="text-slate-400 font-normal">(Optional)</span>}
        </label>
        <p className="text-xs text-slate-500 mb-3">
          {isCodingRole ? "Since you selected a coding target role, we need to analyze your repos to build an accurate curriculum." : "Add GitHub to get a highly accurately personalized learning path based on your code."}
        </p>
        {!githubConnected ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={localUsername}
                  onChange={(e) => setLocalUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-none text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                  disabled={isLoadingAnalysis}
                  onKeyDown={(e) => e.key === 'Enter' && handleGitHubConnect()}
                />
              </div>
              <MatrixButton
                onClick={handleGitHubConnect}
                disabled={!localUsername.trim() || isLoadingAnalysis}
                loading={isLoadingAnalysis}
              >
                {isLoadingAnalysis ? 'Analyzing...' : 'Analyze'}
              </MatrixButton>
            </div>

            {/* Error display */}
            {analysisError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-none text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connected state */}
            <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-none">
              <div className="w-12 h-12 bg-emerald-500 rounded-none flex items-center justify-center">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">@{githubUsername}</h3>
                <p className="text-sm text-emerald-600">Profile analyzed successfully</p>
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-none flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Show analysis result */}
            {analysisResult && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Skill Level</span>
                  <span className={cn(
                    'text-xs px-2.5 py-1 rounded-none font-medium',
                    analysisResult.current_level === 'advanced' && 'bg-purple-100 text-purple-700',
                    analysisResult.current_level === 'intermediate' && 'bg-blue-100 text-blue-700',
                    analysisResult.current_level === 'beginner' && 'bg-green-100 text-green-700',
                  )}>{analysisResult.current_level}</span>
                </div>

                {analysisResult.strong_subskills.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Strong</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {analysisResult.strong_subskills.map((s) => (
                        <span key={s} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-none">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.weak_subskills.length > 0 && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Needs Work</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {analysisResult.weak_subskills.map((s) => (
                        <span key={s} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-none">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-400">Confidence</span>
                  <span className="text-xs font-medium text-slate-600">
                    {Math.round(analysisResult.confidence_score * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-400">Or upload resume</span>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Resume (PDF)</label>
        {!resume ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-none p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-none flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-700 font-medium mb-1">Click to upload your resume</p>
            <p className="text-slate-400 text-sm">PDF, DOCX up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-none">
            <div className="w-12 h-12 bg-emerald-100 rounded-none flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900">{resume.name}</p>
              <p className="text-sm text-slate-500">
                {(resume.size / 1024).toFixed(1)} KB
                {resumeAnalyzed && ' — Analyzed ✓'}
              </p>
            </div>
            <button
              onClick={clearResume}
              className="p-2 hover:bg-emerald-200 rounded-none transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}
      </div>

      {/* LinkedIn (Optional) */}
      <div
        onClick={connectLinkedIn}
        className={cn(
          'relative p-5 rounded-none border-2 cursor-pointer transition-all',
          linkedInConnected
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-12 h-12 rounded-none flex items-center justify-center',
            linkedInConnected ? 'bg-[#0077B5]' : 'bg-slate-100'
          )}>
            <Linkedin className={cn('w-6 h-6', linkedInConnected ? 'text-white' : 'text-[#0077B5]')} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">LinkedIn</h3>
            <p className="text-sm text-slate-500">
              {linkedInConnected ? 'Connected' : 'Sync your experience (optional)'}
            </p>
          </div>
          {linkedInConnected && (
            <div className="w-8 h-8 bg-emerald-500 rounded-none flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-none">
        <div className="w-5 h-5 bg-blue-500 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <p className="text-sm text-blue-700">
          Your GitHub profile will be analyzed to extract skills and experience.
          This helps create a personalized learning path tailored to your gaps.
        </p>
      </div>
    </div>
  );
};
