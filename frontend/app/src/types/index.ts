// User Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  targetRole?: string;
  bio?: string;
  language?: string;
  voiceGuided?: boolean;
  autoPostLinkedIn?: boolean;
  level?: number;
  xp?: number;
  streak?: number;
  coursesCompleted?: number;
  skillsUnlocked?: number;
  linkedInPostsShared?: number;
}

// Onboarding Types
export interface OnboardingState {
  currentStep: number;
  resume: File | null;
  githubConnected: boolean;
  linkedInConnected: boolean;
  selectedPath: string;
  assessmentAnswers: number[];
  assessmentComplete: boolean;
  voiceGuided: boolean;
  language: string;
  autoPostLinkedIn: boolean;
}

// Career Path Types
export interface CareerPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  courses: number;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

// Skill Types
export interface Skill {
  id: string;
  name: string;
  category: string;
  currentLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  requiredLevel: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gap: 'high' | 'medium' | 'low' | 'none';
}

export interface SkillCategory {
  name: string;
  currentScore: number;
  requiredScore: number;
}

// Course Types
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'reading';
  completed: boolean;
  url?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  duration: string;
  skills: string[];
  complementarySkills: string[];
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  checkpoints: Checkpoint[];
  modules: Module[];
}

export interface Checkpoint {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Job Types
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  description: string;
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceLevel: string;
  source: 'linkedin' | 'indeed' | 'glassdoor';
  saved: boolean;
}

// AI Helper Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  dateEarned?: Date;
  locked: boolean;
}

// Progress Types
export interface ProgressData {
  week: string;
  overallScore: number;
  targetRoleMatch: number;
}

// Market Data Types
export interface MarketSkill {
  name: string;
  demandScore: number;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Activity Types
export interface Activity {
  id: string;
  course: string;
  action: string;
  skillGained: string;
  date: Date;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  timestamp: Date;
}
