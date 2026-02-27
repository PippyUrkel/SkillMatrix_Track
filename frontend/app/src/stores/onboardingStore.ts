import { create } from 'zustand';
import type { OnboardingState } from '@/types';
import { api } from '@/lib/api';

// Shape from backend /api/skills/analyze/github and /api/skills/analyze/resume
interface SkillGapReport {
  current_level: string;
  strong_subskills: string[];
  weak_subskills: string[];
  all_skills: Array<{
    name: string;
    proficiency_score: number;
    level: 'strong' | 'moderate' | 'weak';
    evidence: string;
  }>;
  confidence_score: number;
  inferred_from: string;
  target_role: string;
}

interface OnboardingStore extends OnboardingState {
  isLoadingAnalysis: boolean;
  analysisError: string | null;
  analysisResult: SkillGapReport | null;
  githubUsername: string;
  setGithubUsername: (username: string) => void;
  setCurrentStep: (step: number) => void;
  setResume: (file: File | null) => void;
  analyzeResume: (text: string, targetRole: string) => Promise<SkillGapReport>;
  analyzeGitHub: (username: string, targetRole: string) => Promise<SkillGapReport>;
  connectGitHub: () => void;
  connectLinkedIn: () => void;
  setSelectedPath: (path: string) => void;
  setAssessmentAnswer: (questionIndex: number, answer: number) => void;
  setAssessmentComplete: (complete: boolean) => void;
  toggleVoiceGuided: () => void;
  setLanguage: (lang: string) => void;
  toggleAutoPostLinkedIn: () => void;
  saveProfileToBackend: () => Promise<void>;
  reset: () => void;
}

const initialState: OnboardingState = {
  currentStep: 1,
  resume: null,
  githubConnected: false,
  linkedInConnected: false,
  selectedPath: '',
  assessmentAnswers: [],
  assessmentComplete: false,
  voiceGuided: false,
  language: 'English',
  autoPostLinkedIn: false,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,
  isLoadingAnalysis: false,
  analysisError: null,
  analysisResult: null,
  githubUsername: '',

  setGithubUsername: (username) => set({ githubUsername: username }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setResume: (file) => set({ resume: file }),

  analyzeResume: async (resumeText, targetRole) => {
    set({ isLoadingAnalysis: true, analysisError: null });
    try {
      const result = await api.post<SkillGapReport>('/api/skills/analyze/resume', {
        resume_text: resumeText,
        target_role: targetRole,
      });
      set({ isLoadingAnalysis: false, analysisResult: result });
      return result;
    } catch (error: any) {
      set({ isLoadingAnalysis: false, analysisError: error.message });
      throw error;
    }
  },

  analyzeGitHub: async (githubUsername, targetRole) => {
    set({ isLoadingAnalysis: true, analysisError: null });
    try {
      const result = await api.post<SkillGapReport>('/api/skills/analyze/github', {
        github_username: githubUsername,
        target_role: targetRole,
      });
      set({ githubConnected: true, isLoadingAnalysis: false, analysisResult: result });
      return result;
    } catch (error: any) {
      set({ isLoadingAnalysis: false, analysisError: error.message });
      throw error;
    }
  },

  connectGitHub: () => set({ githubConnected: true }),

  connectLinkedIn: () => set({ linkedInConnected: true }),

  setSelectedPath: (path) => set({ selectedPath: path }),

  setAssessmentAnswer: (questionIndex, answer) =>
    set((state) => {
      const newAnswers = [...state.assessmentAnswers];
      newAnswers[questionIndex] = answer;
      return { assessmentAnswers: newAnswers };
    }),

  setAssessmentComplete: (complete) => set({ assessmentComplete: complete }),

  toggleVoiceGuided: () => set((state) => ({ voiceGuided: !state.voiceGuided })),

  setLanguage: (lang) => set({ language: lang }),

  toggleAutoPostLinkedIn: () =>
    set((state) => ({ autoPostLinkedIn: !state.autoPostLinkedIn })),

  saveProfileToBackend: async () => {
    const state = get();
    try {
      // Save target role to profile
      if (state.selectedPath) {
        await api.put('/api/profile/', { target_job: state.selectedPath });
      }

      // Save skills from analysis to backend
      if (state.analysisResult?.all_skills) {
        for (const skill of state.analysisResult.all_skills) {
          await api.post('/api/profile/skills', {
            skill_name: skill.name,
            proficiency_level: skill.level,
          });
        }
      }
    } catch (error) {
      console.error('Failed to save profile to backend:', error);
    }
  },

  reset: () => set({ ...initialState, analysisResult: null, analysisError: null, githubUsername: '' }),
}));
