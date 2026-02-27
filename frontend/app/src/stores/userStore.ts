import { create } from 'zustand';
import type { User } from '@/types';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  notifications: number;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  completeCourse: () => void;
  unlockSkill: () => void;
  shareLinkedInPost: () => void;
}

const defaultUser: User = {
  id: '1',
  email: 'user@skillmatrix.com',
  fullName: 'Alex Developer',
  avatar: '',
  targetRole: 'Software Engineer',
  bio: 'Passionate developer looking to level up my skills',
  language: 'English',
  voiceGuided: false,
  autoPostLinkedIn: false,
  level: 7,
  xp: 2450,
  streak: 12,
  coursesCompleted: 8,
  skillsUnlocked: 24,
  linkedInPostsShared: 5,
};

export const useUserStore = create<UserStore>((set) => ({
  user: defaultUser,
  isAuthenticated: true,
  notifications: 3,

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: () => set({ user: null, isAuthenticated: false }),

  addXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newXP = state.user.xp + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return {
        user: {
          ...state.user,
          xp: newXP,
          level: newLevel,
        },
      };
    }),

  incrementStreak: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, streak: state.user.streak + 1 }
        : null,
    })),

  completeCourse: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, coursesCompleted: state.user.coursesCompleted + 1 }
        : null,
    })),

  unlockSkill: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, skillsUnlocked: state.user.skillsUnlocked + 1 }
        : null,
    })),

  shareLinkedInPost: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, linkedInPostsShared: state.user.linkedInPostsShared + 1 }
        : null,
    })),
}));
