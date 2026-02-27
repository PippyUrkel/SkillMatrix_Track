import { create } from 'zustand';
import { api } from '@/lib/api';
import type {
    CommunityGroup,
    CommunityPost,
    CommunityComment,
    LeaderboardEntry,
} from '@/types';

interface CommunityState {
    // Data
    groups: CommunityGroup[];
    posts: CommunityPost[];
    activeGroup: string | null; // slug or null for "all"
    selectedPost: CommunityPost | null;
    comments: CommunityComment[];
    leaderboard: LeaderboardEntry[];
    sortBy: 'hot' | 'new' | 'top';

    // Loading
    isLoadingGroups: boolean;
    isLoadingPosts: boolean;
    isLoadingComments: boolean;
    isLoadingLeaderboard: boolean;

    // UI
    showCreatePost: boolean;
    setShowCreatePost: (v: boolean) => void;
    setSortBy: (sort: 'hot' | 'new' | 'top') => void;
    setActiveGroup: (slug: string | null) => void;
    setSelectedPost: (post: CommunityPost | null) => void;

    // Actions
    fetchGroups: () => Promise<void>;
    fetchPosts: () => Promise<void>;
    createPost: (data: {
        groupSlug: string;
        title: string;
        body: string;
        tags: string[];
    }) => Promise<void>;
    vote: (postId: string) => Promise<void>;
    joinGroup: (slug: string) => Promise<void>;
    leaveGroup: (slug: string) => Promise<void>;
    fetchComments: (postId: string) => Promise<void>;
    addComment: (postId: string, body: string, parentId?: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    fetchLeaderboard: () => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
    groups: [],
    posts: [],
    activeGroup: null,
    selectedPost: null,
    comments: [],
    leaderboard: [],
    sortBy: 'hot',
    isLoadingGroups: false,
    isLoadingPosts: false,
    isLoadingComments: false,
    isLoadingLeaderboard: false,
    showCreatePost: false,

    setShowCreatePost: (v) => set({ showCreatePost: v }),
    setSortBy: (sort) => {
        set({ sortBy: sort });
        get().fetchPosts();
    },
    setActiveGroup: (slug) => {
        set({ activeGroup: slug });
        get().fetchPosts();
    },
    setSelectedPost: (post) => set({ selectedPost: post }),

    fetchGroups: async () => {
        set({ isLoadingGroups: true });
        try {
            const data = await api.get<CommunityGroup[]>('/api/community/groups');
            set({ groups: data || [], isLoadingGroups: false });
        } catch (e) {
            console.error('fetchGroups failed', e);
            set({ isLoadingGroups: false });
        }
    },

    fetchPosts: async () => {
        set({ isLoadingPosts: true });
        try {
            const { activeGroup, sortBy } = get();
            const params = new URLSearchParams({ sort: sortBy });
            if (activeGroup) params.set('group', activeGroup);
            const data = await api.get<CommunityPost[]>(`/api/community/posts?${params}`);
            set({ posts: data || [], isLoadingPosts: false });
        } catch (e) {
            console.error('fetchPosts failed', e);
            set({ isLoadingPosts: false });
        }
    },

    createPost: async (data) => {
        try {
            await api.post('/api/community/posts', data);
            set({ showCreatePost: false });
            get().fetchPosts();
        } catch (e) {
            console.error('createPost failed', e);
        }
    },

    vote: async (postId) => {
        try {
            const resp = await api.post<{ upvotes: number }>(`/api/community/posts/${postId}/vote`, { direction: 'up' });
            // Optimistic update
            set((state) => ({
                posts: state.posts.map((p) =>
                    p.id === postId
                        ? { ...p, upvotes: resp.upvotes, voted: !p.voted }
                        : p
                ),
                selectedPost:
                    state.selectedPost?.id === postId
                        ? { ...state.selectedPost, upvotes: resp.upvotes, voted: !state.selectedPost.voted }
                        : state.selectedPost,
            }));
        } catch (e) {
            console.error('vote failed', e);
        }
    },

    joinGroup: async (slug) => {
        try {
            await api.post(`/api/community/groups/${slug}/join`, {});
            set((state) => ({
                groups: state.groups.map((g) =>
                    g.slug === slug ? { ...g, joined: true, memberCount: g.memberCount + 1 } : g
                ),
            }));
        } catch (e) {
            console.error('joinGroup failed', e);
        }
    },

    leaveGroup: async (slug) => {
        try {
            await api.post(`/api/community/groups/${slug}/leave`, {});
            set((state) => ({
                groups: state.groups.map((g) =>
                    g.slug === slug ? { ...g, joined: false, memberCount: Math.max(0, g.memberCount - 1) } : g
                ),
            }));
        } catch (e) {
            console.error('leaveGroup failed', e);
        }
    },

    fetchComments: async (postId) => {
        set({ isLoadingComments: true });
        try {
            const data = await api.get<CommunityComment[]>(`/api/community/posts/${postId}/comments`);
            set({ comments: data || [], isLoadingComments: false });
        } catch (e) {
            console.error('fetchComments failed', e);
            set({ isLoadingComments: false });
        }
    },

    addComment: async (postId, body, parentId) => {
        try {
            await api.post(`/api/community/posts/${postId}/comments`, { body, parentId: parentId || null });
            get().fetchComments(postId);
            // Update comment count
            set((state) => ({
                posts: state.posts.map((p) =>
                    p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
                ),
                selectedPost:
                    state.selectedPost?.id === postId
                        ? { ...state.selectedPost, commentCount: state.selectedPost.commentCount + 1 }
                        : state.selectedPost,
            }));
        } catch (e) {
            console.error('addComment failed', e);
        }
    },

    deletePost: async (postId) => {
        try {
            await api.delete(`/api/community/posts/${postId}`);
            set((state) => ({
                posts: state.posts.filter((p) => p.id !== postId),
                selectedPost: state.selectedPost?.id === postId ? null : state.selectedPost,
            }));
        } catch (e) {
            console.error('deletePost failed', e);
        }
    },

    fetchLeaderboard: async () => {
        set({ isLoadingLeaderboard: true });
        try {
            const data = await api.get<LeaderboardEntry[]>('/api/community/leaderboard');
            set({ leaderboard: data || [], isLoadingLeaderboard: false });
        } catch (e) {
            console.error('fetchLeaderboard failed', e);
            set({ isLoadingLeaderboard: false });
        }
    },
}));
