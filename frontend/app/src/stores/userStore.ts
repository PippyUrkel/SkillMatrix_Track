import { create } from 'zustand';
import type { User } from '@/types';
import { api, setAuthToken, clearAuthToken } from '@/lib/api';

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: number;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (credentials: { email: string; password: string; name?: string }) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  completeCourse: () => void;
  unlockSkill: () => void;
  shareLinkedInPost: () => void;
}

// Shape returned by POST /api/auth/login and /api/auth/signup
interface AuthResponse {
  user: { id: string; email: string };
  session: { access_token: string; refresh_token: string; expires_in: number } | null;
}

// Shape returned by GET /api/auth/me
interface MeResponse {
  id: string;
  email: string;
  created_at: string;
}

// Shape returned by GET /api/profile/
interface ProfileResponse {
  id: string;
  name: string | null;
  target_job: string | null;
  skills: Array<{ id?: string; skill_name: string; proficiency_level?: string }>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  notifications: 3,

  setUser: (user) => set({ user, isAuthenticated: true }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const authRes = await api.post<AuthResponse>('/api/auth/login', credentials);

      if (authRes.session?.access_token) {
        setAuthToken(authRes.session.access_token);
      }

      const mappedUser: User = {
        id: authRes.user.id,
        email: authRes.user.email,
        fullName: '',
      };

      try {
        const profile = await api.get<ProfileResponse>('/api/profile/');
        // Use stored name, or fall back to email prefix (never the generic 'User')
        mappedUser.fullName = profile.name || credentials.email.split('@')[0];
        mappedUser.targetRole = profile.target_job || '';
      } catch {
        mappedUser.fullName = credentials.email.split('@')[0];
      }

      set({ user: mappedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (credentials) => {
    set({ isLoading: true });
    try {
      const authRes = await api.post<AuthResponse>('/api/auth/signup', credentials);

      if (authRes.session?.access_token) {
        setAuthToken(authRes.session.access_token);
      }

      const displayName = credentials.name || credentials.email.split('@')[0];
      const mappedUser: User = {
        id: authRes.user.id,
        email: authRes.user.email,
        fullName: displayName,
      };

      // Persist name to backend profile immediately so it survives page refresh
      if (credentials.name) {
        try {
          await api.put('/api/profile/', { name: credentials.name });
        } catch {
          // Non-critical — name will still show in current session
        }
      }

      set({ user: mappedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMe: async () => {
    const token = localStorage.getItem('sm_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    set({ isLoading: true });
    try {
      const me = await api.get<MeResponse>('/api/auth/me');

      const mappedUser: User = {
        id: me.id,
        email: me.email,
        fullName: '',
      };

      try {
        const profile = await api.get<ProfileResponse>('/api/profile/');
        // Use stored name, or fall back to email prefix (never 'User')
        mappedUser.fullName = profile.name || me.email.split('@')[0];
        mappedUser.targetRole = profile.target_job || '';
      } catch {
        mappedUser.fullName = me.email.split('@')[0];
      }

      set({ user: mappedUser, isAuthenticated: true, isLoading: false });
    } catch {
      clearAuthToken();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    clearAuthToken();
    set({ user: null, isAuthenticated: false });
  },

  addXP: (amount) =>
    set((state) => {
      if (!state.user) return state;
      const newXP = (state.user.xp || 0) + amount;
      const newLevel = Math.floor(newXP / 500) + 1;
      return {
        user: { ...state.user, xp: newXP, level: newLevel },
      };
    }),

  incrementStreak: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, streak: (state.user.streak || 0) + 1 }
        : null,
    })),

  completeCourse: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, coursesCompleted: (state.user.coursesCompleted || 0) + 1 }
        : null,
    })),

  unlockSkill: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, skillsUnlocked: (state.user.skillsUnlocked || 0) + 1 }
        : null,
    })),

  shareLinkedInPost: () =>
    set((state) => ({
      user: state.user
        ? { ...state.user, linkedInPostsShared: (state.user.linkedInPostsShared || 0) + 1 }
        : null,
    })),
}));
