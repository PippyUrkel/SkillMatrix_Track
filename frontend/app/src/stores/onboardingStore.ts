import { create } from 'zustand';
import type { OnboardingState } from '@/types';

interface OnboardingStore extends OnboardingState {
  setCurrentStep: (step: number) => void;
  setResume: (file: File | null) => void;
  connectGitHub: () => void;
  connectLinkedIn: () => void;
  setSelectedPath: (path: string) => void;
  setAssessmentAnswer: (questionIndex: number, answer: number) => void;
  setAssessmentComplete: (complete: boolean) => void;
  toggleVoiceGuided: () => void;
  setLanguage: (lang: string) => void;
  toggleAutoPostLinkedIn: () => void;
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

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,

  setCurrentStep: (step) => set({ currentStep: step }),

  setResume: (file) => set({ resume: file }),

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

  reset: () => set(initialState),
}));
