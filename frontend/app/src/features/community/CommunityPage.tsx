import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useCommunityStore } from '@/stores/communityStore';
import {
    Users,
    ArrowBigUp,
    MessageSquare,
    Pin,
    Plus,
    X,
    Send,
    Trophy,
    Flame,
    Clock,
    TrendingUp,
    BarChart3,
} from 'lucide-react';
import type { CommunityPost, CommunityComment } from '@/types';

interface CommunityPageProps {
    onNavigate: (path: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onNavigate }) => {
    const {
        groups,
        posts,
        activeGroup,
        selectedPost,
        comments,
        leaderboard,
        sortBy,
        isLoadingPosts,
        isLoadingComments,
        showCreatePost,
        setShowCreatePost,
        setSortBy,
        setActiveGroup,
        setSelectedPost,
        fetchGroups,
        fetchPosts,
        createPost,
        vote,
        joinGroup,
        leaveGroup,
        fetchComments,
        addComment,
        fetchLeaderboard,
    } = useCommunityStore();

    // Create post form
    const [newTitle, setNewTitle] = useState('');
    const [newBody, setNewBody] = useState('');
    const [newTags, setNewTags] = useState('');
    const [commentInput, setCommentInput] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');

    useEffect(() => {
        fetchGroups();
        fetchPosts();
        fetchLeaderboard();
    }, []);

    const handleCreatePost = () => {
        if (!newTitle.trim() || !newBody.trim()) return;
        const group = activeGroup || groups[0]?.slug || 'fullstack';
        createPost({
            groupSlug: group,
            title: newTitle,
            body: newBody,
            tags: newTags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        });
        setNewTitle('');
        setNewBody('');
        setNewTags('');
    };

    const handleComment = () => {
        if (!commentInput.trim() || !selectedPost) return;
        addComment(selectedPost.id, commentInput);
        setCommentInput('');
    };

    const handleReply = (parentId: string) => {
        if (!replyInput.trim() || !selectedPost) return;
        addComment(selectedPost.id, replyInput, parentId);
        setReplyInput('');
        setReplyTo(null);
    };

    const openPost = (post: CommunityPost) => {
        setSelectedPost(post);
        fetchComments(post.id);
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const activeGroupObj = groups.find((g) => g.slug === activeGroup);

    // ── Post Detail Modal ──
    if (selectedPost) {
        return (
            <DashboardLayout activeItem="community" onNavigate={onNavigate} title="Community">
                <div className="max-w-4xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => setSelectedPost(null)}
                        className="mb-4 px-4 py-2 bg-white border-[3px] border-black text-black font-black text-xs uppercase tracking-wider hover:bg-brutal-yellow transition-colors"
                        style={{ boxShadow: '3px 3px 0 #000' }}
                    >
                        ← Back to Feed
                    </button>

                    {/* Post detail card */}
                    <div
                        className="bg-white border-[3px] border-black p-6"
                        style={{ boxShadow: '5px 5px 0 #000' }}
                    >
                        <div className="flex gap-4">
                            {/* Vote column */}
                            <div className="flex flex-col items-center gap-1 pt-1">
                                <button
                                    onClick={() => vote(selectedPost.id)}
                                    className={`w-10 h-10 border-[2.5px] border-black flex items-center justify-center transition-colors ${selectedPost.voted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-white text-black hover:bg-emerald-100'
                                        }`}
                                    style={{ boxShadow: '2px 2px 0 #000' }}
                                >
                                    <ArrowBigUp className="w-5 h-5" />
                                </button>
                                <span className="text-lg font-black">{selectedPost.upvotes}</span>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedPost.isPinned && (
                                        <span className="bg-brutal-yellow border-[2px] border-black px-2 py-0.5 text-[10px] font-black uppercase">
                                            📌 Pinned
                                        </span>
                                    )}
                                    <span className="text-[11px] font-bold text-black/50 uppercase tracking-wider">
                                        {selectedPost.groupSlug} · {selectedPost.authorName} · {timeAgo(selectedPost.createdAt)}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-black mb-3">{selectedPost.title}</h2>
                                <p className="text-sm font-medium text-black/80 leading-relaxed whitespace-pre-wrap mb-4">
                                    {selectedPost.body}
                                </p>
                                {selectedPost.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {selectedPost.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-purple-200 border-[2px] border-black text-[10px] font-black uppercase"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Progress snapshot */}
                                {selectedPost.progressSnapshot && (
                                    <div
                                        className="bg-emerald-100 border-[2.5px] border-black p-4 mb-4"
                                        style={{ boxShadow: '3px 3px 0 #000' }}
                                    >
                                        <h4 className="font-black text-xs uppercase tracking-wider mb-2">📊 Progress Snapshot</h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-black/50 uppercase">Roadmap</p>
                                                <p className="font-black text-sm">{selectedPost.progressSnapshot.roadmap || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-black/50 uppercase">Completed</p>
                                                <p className="font-black text-sm">{selectedPost.progressSnapshot.percentComplete}%</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-black/50 uppercase">Time</p>
                                                <p className="font-black text-sm">{selectedPost.progressSnapshot.timeSpentHours}h</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Comments section */}
                    <div className="mt-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3">
                            💬 Comments ({selectedPost.commentCount})
                        </h3>

                        {/* Add comment */}
                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={commentInput}
                                onChange={(e) => setCommentInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white border-[2.5px] border-black px-4 py-3 text-sm font-bold placeholder:text-black/30 focus:outline-none"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                            />
                            <button
                                onClick={handleComment}
                                disabled={!commentInput.trim()}
                                className="px-4 py-3 bg-emerald-500 text-white border-[2.5px] border-black font-black disabled:opacity-40 hover:bg-emerald-600 transition-colors"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Comments list */}
                        {isLoadingComments ? (
                            <p className="text-sm font-bold text-black/40 italic animate-pulse">Loading comments...</p>
                        ) : (
                            <div className="space-y-3">
                                {comments.map((c) => (
                                    <CommentCard
                                        key={c.id}
                                        comment={c}
                                        replyTo={replyTo}
                                        replyInput={replyInput}
                                        setReplyTo={setReplyTo}
                                        setReplyInput={setReplyInput}
                                        onReply={handleReply}
                                        timeAgo={timeAgo}
                                    />
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-sm font-bold text-black/30 italic">No comments yet — be the first!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ── Main Feed View ──
    return (
        <DashboardLayout activeItem="community" onNavigate={onNavigate} title="Community">
            <div className="flex gap-6">
                {/* ── Left: Group sidebar ── */}
                <div className="w-64 flex-shrink-0 space-y-3">
                    <div
                        className="bg-white border-[3px] border-black p-4"
                        style={{ boxShadow: '4px 4px 0 #000' }}
                    >
                        <h3 className="font-black text-xs uppercase tracking-wider mb-3">🏘️ Subgroups</h3>
                        <div className="space-y-1.5">
                            <button
                                onClick={() => setActiveGroup(null)}
                                className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border-[2px] border-black transition-colors ${!activeGroup
                                    ? 'bg-brutal-yellow text-black'
                                    : 'bg-white text-black/70 hover:bg-brutal-yellow/30'
                                    }`}
                                style={!activeGroup ? { boxShadow: '2px 2px 0 #000' } : undefined}
                            >
                                🌐 All Groups
                            </button>
                            {groups.map((g) => (
                                <button
                                    key={g.slug}
                                    onClick={() => setActiveGroup(g.slug)}
                                    className={`w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-wider border-[2px] border-black transition-colors flex items-center justify-between ${activeGroup === g.slug
                                        ? 'bg-brutal-yellow text-black'
                                        : 'bg-white text-black/70 hover:bg-brutal-yellow/30'
                                        }`}
                                    style={activeGroup === g.slug ? { boxShadow: '2px 2px 0 #000' } : undefined}
                                >
                                    <span>
                                        {g.icon} {g.name.split(' ')[0]}
                                    </span>
                                    <span className="text-[9px] font-black text-black/40">{g.memberCount}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Group info card */}
                    {activeGroupObj && (
                        <div
                            className="bg-white border-[3px] border-black p-4"
                            style={{ boxShadow: '4px 4px 0 #000' }}
                        >
                            <h4 className="font-black text-sm mb-1">
                                {activeGroupObj.icon} {activeGroupObj.name}
                            </h4>
                            <p className="text-[11px] font-medium text-black/60 mb-3">{activeGroupObj.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-3.5 h-3.5" />
                                <span className="text-xs font-black">{activeGroupObj.memberCount} members</span>
                            </div>
                            {activeGroupObj.joined ? (
                                <button
                                    onClick={() => leaveGroup(activeGroupObj.slug)}
                                    className="w-full px-3 py-2 bg-red-100 text-red-700 border-[2px] border-black text-xs font-black uppercase hover:bg-red-200 transition-colors"
                                    style={{ boxShadow: '2px 2px 0 #000' }}
                                >
                                    Leave Group
                                </button>
                            ) : (
                                <button
                                    onClick={() => joinGroup(activeGroupObj.slug)}
                                    className="w-full px-3 py-2 bg-emerald-500 text-white border-[2px] border-black text-xs font-black uppercase hover:bg-emerald-600 transition-colors"
                                    style={{ boxShadow: '2px 2px 0 #000' }}
                                >
                                    Join Group
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Center: Feed ── */}
                <div className="flex-1 min-w-0">
                    {/* Top bar — sort + create */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1.5">
                            {[
                                { key: 'hot' as const, icon: Flame, label: 'Hot' },
                                { key: 'new' as const, icon: Clock, label: 'New' },
                                { key: 'top' as const, icon: TrendingUp, label: 'Top' },
                            ].map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSortBy(s.key)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-black uppercase tracking-wider border-[2.5px] border-black transition-colors ${sortBy === s.key
                                        ? 'bg-brutal-yellow text-black'
                                        : 'bg-white text-black/60 hover:bg-brutal-yellow/30'
                                        }`}
                                    style={sortBy === s.key ? { boxShadow: '2px 2px 0 #000' } : undefined}
                                >
                                    <s.icon className="w-3.5 h-3.5" />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white border-[2.5px] border-black text-xs font-black uppercase hover:bg-emerald-600 transition-colors"
                            style={{ boxShadow: '3px 3px 0 #000' }}
                        >
                            <Plus className="w-4 h-4" />
                            New Post
                        </button>
                    </div>

                    {/* Posts */}
                    {isLoadingPosts ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white border-[3px] border-black p-5 animate-pulse h-28"
                                    style={{ boxShadow: '4px 4px 0 #000' }}
                                />
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <div
                            className="bg-white border-[3px] border-black p-10 text-center"
                            style={{ boxShadow: '4px 4px 0 #000' }}
                        >
                            <Users className="w-12 h-12 mx-auto text-black/20 mb-3" />
                            <h3 className="font-black text-lg mb-1">No posts yet</h3>
                            <p className="text-sm font-medium text-black/50">Be the first to start a discussion!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white border-[3px] border-black p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
                                    style={{ boxShadow: '4px 4px 0 #000' }}
                                    onClick={() => openPost(post)}
                                >
                                    <div className="flex gap-3">
                                        {/* Vote */}
                                        <div className="flex flex-col items-center gap-0.5">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    vote(post.id);
                                                }}
                                                className={`w-8 h-8 border-[2px] border-black flex items-center justify-center text-sm transition-colors ${post.voted
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-white text-black hover:bg-emerald-100'
                                                    }`}
                                                style={{ boxShadow: '1px 1px 0 #000' }}
                                            >
                                                <ArrowBigUp className="w-4 h-4" />
                                            </button>
                                            <span className="text-xs font-black">{post.upvotes}</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {post.isPinned && (
                                                    <Pin className="w-3 h-3 text-brutal-yellow" />
                                                )}
                                                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                                                    {post.groupSlug} · {post.authorName} · {timeAgo(post.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-sm text-black mb-1 truncate">{post.title}</h3>
                                            <p className="text-xs font-medium text-black/50 line-clamp-2">{post.body}</p>

                                            <div className="flex items-center gap-3 mt-2">
                                                {post.tags.slice(0, 3).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-1.5 py-0.5 bg-purple-100 border border-black/20 text-[9px] font-black uppercase"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-black/40 ml-auto">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {post.commentCount}
                                                </span>
                                            </div>

                                            {/* Progress snapshot mini badge */}
                                            {post.progressSnapshot && (
                                                <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-black/10 px-2 py-1 w-fit">
                                                    <BarChart3 className="w-3 h-3 text-emerald-600" />
                                                    <span className="text-[10px] font-black text-emerald-700">
                                                        {post.progressSnapshot.percentComplete}% complete
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Right: Leaderboard ── */}
                <div className="w-64 flex-shrink-0 space-y-3">
                    {/* Leaderboard */}
                    <div
                        className="bg-white border-[3px] border-black p-4"
                        style={{ boxShadow: '4px 4px 0 #000' }}
                    >
                        <h3 className="font-black text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-brutal-yellow" />
                            Leaderboard
                        </h3>
                        <div className="space-y-2">
                            {leaderboard.slice(0, 8).map((entry, i) => (
                                <div
                                    key={entry.userId}
                                    className={`flex items-center gap-2 px-2 py-1.5 border-[2px] border-black text-xs ${i === 0
                                        ? 'bg-brutal-yellow'
                                        : i === 1
                                            ? 'bg-gray-100'
                                            : i === 2
                                                ? 'bg-orange-100'
                                                : 'bg-white'
                                        }`}
                                    style={i < 3 ? { boxShadow: '2px 2px 0 #000' } : undefined}
                                >
                                    <span className="font-black text-[10px] w-5 text-center">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </span>
                                    <span className="flex-1 font-bold truncate">{entry.userName}</span>
                                    <span className="text-[9px] font-black text-black/40">
                                        {entry.badge} {entry.totalUpvotes}↑
                                    </span>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <p className="text-[10px] font-bold text-black/30 italic">No activity yet</p>
                            )}
                        </div>
                    </div>

                    {/* Streak info */}
                    <div
                        className="bg-emerald-500 border-[3px] border-black p-4 text-white"
                        style={{ boxShadow: '4px 4px 0 #000' }}
                    >
                        <h3 className="font-black text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Flame className="w-4 h-4" />
                            Streak Badges
                        </h3>
                        <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                                <span className="font-bold">🔥 On Fire</span>
                                <span className="font-black">10+ posts</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">⚡ Active</span>
                                <span className="font-black">5+ posts</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">✨ Rising</span>
                                <span className="font-black">3+ posts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Create Post Modal ── */}
            {showCreatePost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreatePost(false)} />
                    <div
                        className="relative bg-[#FFFDF7] border-[4px] border-black p-6 w-full max-w-lg"
                        style={{ boxShadow: '6px 6px 0 #000' }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-black text-lg uppercase tracking-wider">New Post</h3>
                            <button
                                onClick={() => setShowCreatePost(false)}
                                className="w-8 h-8 bg-white border-[2.5px] border-black flex items-center justify-center hover:bg-red-400 hover:text-white transition-colors"
                                style={{ boxShadow: '2px 2px 0 #000' }}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Group selection */}
                        <label className="block mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Group</span>
                            <select
                                className="w-full mt-1 bg-white border-[2.5px] border-black px-3 py-2 text-sm font-bold focus:outline-none"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                                value={activeGroup || groups[0]?.slug || ''}
                                onChange={(e) => setActiveGroup(e.target.value)}
                            >
                                {groups.map((g) => (
                                    <option key={g.slug} value={g.slug}>
                                        {g.icon} {g.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Title</span>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full mt-1 bg-white border-[2.5px] border-black px-3 py-2.5 text-sm font-bold placeholder:text-black/30 focus:outline-none"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                            />
                        </label>

                        <label className="block mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Body</span>
                            <textarea
                                value={newBody}
                                onChange={(e) => setNewBody(e.target.value)}
                                placeholder="Share your thoughts, ask a question, or start a discussion..."
                                rows={5}
                                className="w-full mt-1 bg-white border-[2.5px] border-black px-3 py-2.5 text-sm font-bold placeholder:text-black/30 focus:outline-none resize-none"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                            />
                        </label>

                        <label className="block mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black/50">
                                Tags (comma-separated)
                            </span>
                            <input
                                type="text"
                                value={newTags}
                                onChange={(e) => setNewTags(e.target.value)}
                                placeholder="react, python, career"
                                className="w-full mt-1 bg-white border-[2.5px] border-black px-3 py-2.5 text-sm font-bold placeholder:text-black/30 focus:outline-none"
                                style={{ boxShadow: '3px 3px 0 #000' }}
                            />
                        </label>

                        <button
                            onClick={handleCreatePost}
                            disabled={!newTitle.trim() || !newBody.trim()}
                            className="w-full px-4 py-3 bg-emerald-500 text-white border-[3px] border-black font-black uppercase tracking-wider disabled:opacity-40 hover:bg-emerald-600 transition-colors"
                            style={{ boxShadow: '4px 4px 0 #000' }}
                        >
                            Publish Post
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

// ── Comment subcomponent ──

interface CommentCardProps {
    comment: CommunityComment;
    replyTo: string | null;
    replyInput: string;
    setReplyTo: (id: string | null) => void;
    setReplyInput: (v: string) => void;
    onReply: (parentId: string) => void;
    timeAgo: (d: string) => string;
}

const CommentCard: React.FC<CommentCardProps> = ({
    comment,
    replyTo,
    replyInput,
    setReplyTo,
    setReplyInput,
    onReply,
    timeAgo,
}) => (
    <div className="border-l-[3px] border-black pl-4 space-y-2">
        <div className="bg-white border-[2px] border-black p-3" style={{ boxShadow: '2px 2px 0 #000' }}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">{comment.authorName}</span>
                <span className="text-[9px] font-bold text-black/30">{timeAgo(comment.createdAt)}</span>
            </div>
            <p className="text-xs font-medium text-black/80">{comment.body}</p>
            <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="mt-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800"
            >
                Reply
            </button>
        </div>

        {/* Reply input */}
        {replyTo === comment.id && (
            <div className="flex gap-2 ml-4">
                <input
                    type="text"
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onReply(comment.id)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-white border-[2px] border-black px-3 py-2 text-xs font-bold placeholder:text-black/30 focus:outline-none"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                    autoFocus
                />
                <button
                    onClick={() => onReply(comment.id)}
                    className="px-3 py-2 bg-emerald-500 text-white border-[2px] border-black font-black text-xs"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                >
                    <Send className="w-3 h-3" />
                </button>
            </div>
        )}

        {/* Nested replies */}
        {comment.replies.length > 0 && (
            <div className="ml-4 space-y-2">
                {comment.replies.map((reply) => (
                    <div
                        key={reply.id}
                        className="bg-gray-50 border-[2px] border-black p-3"
                        style={{ boxShadow: '1px 1px 0 #000' }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider">{reply.authorName}</span>
                            <span className="text-[9px] font-bold text-black/30">{timeAgo(reply.createdAt)}</span>
                        </div>
                        <p className="text-xs font-medium text-black/80">{reply.body}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);
