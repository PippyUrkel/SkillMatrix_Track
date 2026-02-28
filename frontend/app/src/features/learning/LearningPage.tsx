import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { StreakToast } from '@/components/ui/StreakToast';
import { useDashboardStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  Info,
  CheckCircle,
  CheckSquare,
  FileText,
  Download,
  Clock,
  ChevronRight,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Bot,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Loader2,
  GraduationCap,
  ExternalLink,
  Star,
  DollarSign,
  Trash2,
  AlertTriangle,
  Brain,
  ClipboardCheck,
} from 'lucide-react';
import { AIHelper } from '@/features/aihelper';
import { QuizGenerator } from '@/features/quiz';
import { CertificateModal } from '@/features/certificates';
import { LinkedInPostGenerator } from '@/features/linkedin';

interface LearningPageProps {
  onNavigate: (path: string) => void;
}

// ─── Delete Confirmation Modal (double verification) ──────────────────────────
const DeleteConfirmModal: React.FC<{
  courseName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}> = ({ courseName, onConfirm, onCancel, isDeleting }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [typed, setTyped] = useState('');

  const shortName = courseName.length > 30 ? courseName.slice(0, 27) + '…' : courseName;
  const isMatch = typed.trim().toLowerCase() === 'delete';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white border-[4px] border-black w-full max-w-md p-6"
        style={{ boxShadow: '6px 6px 0 #000' }}
      >
        {step === 1 ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 bg-red-400 border-[2.5px] border-black flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                <Trash2 className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider">Delete Course</h3>
            </div>
            <p className="text-sm font-medium text-black/70 mb-2">
              You are about to permanently delete:
            </p>
            <div
              className="bg-red-50 border-[2.5px] border-black p-3 mb-4"
              style={{ boxShadow: '2px 2px 0 #000' }}
            >
              <p className="font-black text-sm text-black">{shortName}</p>
            </div>
            <p className="text-xs font-medium text-black/50 mb-6">
              All progress, notes, and data for this course will be lost forever. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-white border-[3px] border-black font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-red-400 text-black border-[3px] border-black font-black text-xs uppercase tracking-wider hover:bg-red-500 transition-colors"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                I Understand, Continue →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 bg-red-500 border-[2.5px] border-black flex items-center justify-center"
                style={{ boxShadow: '2px 2px 0 #000' }}
              >
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider">Final Confirmation</h3>
            </div>
            <p className="text-sm font-medium text-black/70 mb-4">
              Type <span className="font-black bg-brutal-yellow px-1.5 py-0.5 border border-black">DELETE</span> below to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full bg-white border-[2.5px] border-black px-4 py-3 text-sm font-bold placeholder:text-black/30 focus:outline-none mb-4"
              style={{ boxShadow: '3px 3px 0 #000' }}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && isMatch && onConfirm()}
            />
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 bg-white border-[3px] border-black font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                ← Go Back
              </button>
              <button
                onClick={onConfirm}
                disabled={!isMatch || isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white border-[3px] border-black font-black text-xs uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ boxShadow: '3px 3px 0 #000' }}
              >
                {isDeleting ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Course Library (card grid) ───────────────────────────────────────────────
const CourseLibrary: React.FC<{
  courses: any[];
  onSelectCourse: (id: string) => void;
  onGenerate: () => void;
  onDeleteCourse: (courseId: string) => Promise<boolean>;
  isGenerating: boolean;
  isLoading: boolean;
}> = ({ courses, onSelectCourse, onGenerate, onDeleteCourse, isGenerating, isLoading }) => {
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await onDeleteCourse(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
          <p className="text-slate-500 text-sm mt-0.5">{courses.length} course{courses.length !== 1 ? 's' : ''} in your library</p>
        </div>
        <MatrixButton onClick={onGenerate} disabled={isGenerating}>
          <Plus className="w-4 h-4 mr-2" />
          {isGenerating ? 'Generating…' : 'New Course'}
        </MatrixButton>
      </div>

      {/* Cards grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course) => {
            const totalLessons = course.modules?.reduce((s: number, m: any) => s + m.lessons.length, 0) ?? 0;
            const doneLessons = course.modules?.reduce((s: number, m: any) => s + m.lessons.filter((l: any) => l.completed).length, 0) ?? 0;
            return (
              <MatrixCard
                key={course.id}
                className="group cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all duration-200 overflow-hidden p-0 relative"
                onClick={() => onSelectCourse(course.id)}
              >
                {/* Thumbnail */}
                <div className="relative h-36 overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {course.status === 'completed' && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-none flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Done
                    </div>
                  )}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget({ id: course.id, title: course.title });
                    }}
                    className="absolute top-3 left-3 w-8 h-8 bg-white/90 border-2 border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-400 hover:text-white"
                    style={{ boxShadow: '2px 2px 0 #000' }}
                    title="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {course.skills.slice(0, 2).map((s: string) => (
                      <MatrixBadge key={s} variant="accent" size="sm">{s}</MatrixBadge>
                    ))}
                  </div>
                  <h3 className="font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-3 text-slate-400 text-xs mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                    <span>{totalLessons} lessons</span>
                  </div>
                  <MatrixProgress value={course.progress} showLabel size="sm" />
                  <MatrixButton variant="secondary" size="sm" className="w-full mt-3">
                    {course.progress === 0 ? 'Start' : course.progress === 100 ? 'Review' : 'Continue'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </MatrixButton>
                </div>
              </MatrixCard>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-brutal-yellow border-2 border-black rounded-none flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <GraduationCap className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm">Generate your first AI-curated learning path tailored to your skill gaps.</p>
          <MatrixButton onClick={onGenerate} disabled={isGenerating}>
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating…' : 'Generate My First Course'}
          </MatrixButton>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          courseName={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

// ─── Generate Course Modal ─────────────────────────────────────────────────────
const GenerateModal: React.FC<{
  defaultTopic: string;
  onGenerate: (topic: string) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ defaultTopic, onGenerate, onClose, isLoading }) => {
  const [topic, setTopic] = useState(defaultTopic);
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900 uppercase">Generate New Course</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border-2 border-transparent rounded-none hover:border-black hover:bg-brutal-pink transition-all group">
            <X className="w-4 h-4 text-slate-900 group-hover:text-black" />
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-4">What do you want to learn? I'll build a progressive curriculum with curated YouTube resources.</p>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. System Design, Advanced React, Docker…"
          className="w-full border-2 border-black rounded-none px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-brutal-blue/10 focus:bg-brutal-blue/20 transition-all mb-4"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && topic.trim() && onGenerate(topic.trim())}
        />
        <div className="flex gap-3">
          <MatrixButton variant="secondary" className="flex-1" onClick={onClose}>Cancel</MatrixButton>
          <MatrixButton className="flex-1" disabled={!topic.trim() || isLoading} onClick={() => onGenerate(topic.trim())}>
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
          </MatrixButton>
        </div>
      </div>
    </div>
  );
};

// ─── Paid Courses Grid ────────────────────────────────────────────────────────
interface PaidCourse {
  title: string;
  platform: string;
  description: string;
  estimated_price: string;
  url: string;
  difficulty: string;
  estimated_duration: string;
  rating: number;
}

const PLATFORM_STYLES: Record<string, { bg: string; border: string }> = {
  Coursera: { bg: 'bg-blue-500', border: 'border-blue-500' },
  Udemy: { bg: 'bg-purple-600', border: 'border-purple-600' },
  edX: { bg: 'bg-red-500', border: 'border-red-500' },
};

const PaidCoursesGrid: React.FC<{ targetRole: string }> = ({ targetRole }) => {
  const [courses, setCourses] = useState<PaidCourse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState(targetRole || '');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<{ courses: PaidCourse[] }>('/api/courses/paid', {
        topic: topic.trim(),
        skill_level: 'beginner',
        max_results: 6,
      });
      setCourses(res.courses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Machine Learning, System Design…"
          className="flex-1 border-2 border-black rounded-none px-4 py-3 text-black font-medium focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(255,222,89,1)] transition-all"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <MatrixButton onClick={handleGenerate} disabled={isLoading || !topic.trim()}>
          {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Finding…</> : <><Sparkles className="w-4 h-4 mr-2" />Find Courses</>}
        </MatrixButton>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-50 p-4 text-red-700 font-medium text-sm">{error}</div>
      )}

      {/* Results */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course, idx) => {
            const style = PLATFORM_STYLES[course.platform] || PLATFORM_STYLES.Udemy;
            return (
              <div
                key={idx}
                className="bg-white border-2 border-black p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col"
              >
                {/* Platform header */}
                <div className={`${style.bg} px-4 py-2 flex items-center justify-between`}>
                  <span className="text-white font-black text-xs uppercase tracking-wider">{course.platform}</span>
                  <span className="text-white/80 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />{course.rating.toFixed(1)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-black text-black text-sm mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-black/60 text-xs mb-4 line-clamp-2 flex-1">{course.description}</p>

                  <div className="flex items-center gap-3 text-xs text-black/50 font-bold mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />{course.estimated_price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{course.estimated_duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 border border-black font-bold uppercase',
                      course.difficulty === 'beginner' && 'bg-green-100 text-green-800',
                      course.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-800',
                      course.difficulty === 'advanced' && 'bg-red-100 text-red-800',
                    )}>
                      {course.difficulty}
                    </span>
                    <div className="flex-1" />
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-xs font-black uppercase hover:bg-brutal-yellow hover:text-black border-2 border-black transition-all"
                    >
                      View Course <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-brutal-purple border-2 border-black rounded-none flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <DollarSign className="w-10 h-10 text-black" />
          </div>
          <h3 className="text-xl font-black text-black uppercase mb-2">Paid Course Finder</h3>
          <p className="text-black/60 mb-6 max-w-sm font-medium">Search for premium courses from Coursera, Udemy, and edX tailored to your learning goals.</p>
          <MatrixButton onClick={handleGenerate} disabled={!topic.trim()}>
            <Sparkles className="w-4 h-4 mr-2" />Find Paid Courses
          </MatrixButton>
        </div>
      )}
    </div>
  );
};

// ─── Main LearningPage ─────────────────────────────────────────────────────────
export const LearningPage: React.FC<LearningPageProps> = ({ onNavigate }) => {
  const {
    courses,
    activeCourse,
    setActiveCourse,
    completeCourse,
    markLessonComplete,
    fetchCourseDetail,
    isChatOpen,
    setChatOpen,
    isSidebarCollapsed,
    toggleSidebar,
    generateCurriculum,
    isLoadingCurriculum,
    setActiveVideoUrl,
    deleteCourse,
  } = useDashboardStore();

  const { addXP, user } = useUserStore();

  // ── View state ────────────────────────────────
  const [view, setView] = useState<'library' | 'player'>('library');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [libraryTab, setLibraryTab] = useState<'free' | 'paid'>('free');
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  // ── Player state ──────────────────────────────
  const [activeTab, setActiveTab] = useState<'overview' | 'checkpoints' | 'notes'>('overview');
  const [notes, setNotes] = useState('');
  const [notesMode, setNotesMode] = useState<'edit' | 'preview'>('edit');
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [focusMode, setFocusMode] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [selectedLessonUrl, setSelectedLessonUrl] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState<string | null>(null);
  const [showCertModal, setShowCertModal] = useState<string | null>(null);
  const [showLinkedInModal, setShowLinkedInModal] = useState<string | null>(null);
  const [assessmentModule, setAssessmentModule] = useState<{ title: string; topic: string } | null>(null);

  const videoRef = useRef<HTMLDivElement>(null);
  const prevSidebarState = useRef(isSidebarCollapsed);

  // ── Select course from library ────────────────
  const handleSelectCourse = async (courseId: string) => {
    const local = courses.find((c) => c.id === courseId);
    const hasModules = local && local.modules && local.modules.length > 0;

    if (hasModules) {
      setActiveCourse(local!);
    } else {
      setLoadingCourseId(courseId);
      await fetchCourseDetail(courseId);
      setLoadingCourseId(null);
    }

    // Reset player state
    setSelectedLessonUrl(null);
    setSelectedLessonId(null);
    setExpandedModules({});
    setView('player');
  };

  // ── Generate course ───────────────────────────
  const handleGenerate = async (topic: string) => {
    setShowGenerateModal(false);
    await generateCurriculum(topic, { durationDays: 7, dailyMinutes: 60 });
    // After generation, go straight to player with the new course
    setView('player');
  };

  // ── Auto-open first module in player ─────────
  useEffect(() => {
    if (view === 'player' && activeCourse && activeCourse.modules.length > 0) {
      const firstId = activeCourse.modules[0].id;
      setExpandedModules({ [firstId]: true });
    }
  }, [view, activeCourse?.id]);

  // ── YouTube embed helper ──────────────────────
  const getYouTubeEmbedId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&]+)/,
      /(?:youtu\.be\/)([^?]+)/,
      /(?:youtube\.com\/embed\/)([^?]+)/,
    ];
    for (const p of patterns) {
      const match = url.match(p);
      if (match) return match[1];
    }
    return null;
  };

  const getActiveVideoUrl = (): string | null => {
    if (selectedLessonUrl) return selectedLessonUrl;
    if (!activeCourse) return null;
    for (const m of activeCourse.modules) {
      for (const l of m.lessons) {
        if (l.url) return l.url;
      }
    }
    return null;
  };

  // Keep the active video URL synced to the global store for the AI Helper
  useEffect(() => {
    setActiveVideoUrl(getActiveVideoUrl());
  }, [selectedLessonUrl, activeCourse, setActiveVideoUrl]);

  // ── Lesson navigation ─────────────────────────
  const allLessons = activeCourse ? activeCourse.modules.flatMap((m) => m.lessons) : [];
  const currentLessonIndex = selectedLessonId ? allLessons.findIndex((l) => l.id === selectedLessonId) : -1;
  const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleMarkDoneAndNext = () => {
    if (!activeCourse || !currentLesson) return;
    markLessonComplete(activeCourse.id, currentLesson.id);
    addXP(20);
    if (nextLesson) {
      setSelectedLessonUrl(nextLesson.url || null);
      setSelectedLessonId(nextLesson.id);
    }
  };

  // ── Focus/mini-player ─────────────────────────
  const enterFocusMode = useCallback(() => {
    prevSidebarState.current = isSidebarCollapsed;
    if (!isSidebarCollapsed) toggleSidebar();
    if (isChatOpen) setChatOpen(false);
    setFocusMode(true);
  }, [isSidebarCollapsed, isChatOpen, toggleSidebar, setChatOpen]);

  const exitFocusMode = useCallback(() => {
    if (!prevSidebarState.current && isSidebarCollapsed) toggleSidebar();
    setFocusMode(false);
  }, [isSidebarCollapsed, toggleSidebar]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape' && focusMode) exitFocusMode(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [focusMode, exitFocusMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current && !focusMode) {
        const rect = videoRef.current.getBoundingClientRect();
        setShowMiniPlayer(rect.bottom < -50);
      }
    };
    const el = document.querySelector('.custom-scrollbar');
    if (el) { el.addEventListener('scroll', handleScroll); return () => el.removeEventListener('scroll', handleScroll); }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [focusMode]);

  const handleComplete = () => {
    if (!activeCourse) return;
    completeCourse(activeCourse.id);
    addXP(150);
    setShowCertModal(activeCourse.id);
  };

  const toggleModule = (id: string) => setExpandedModules((p) => ({ ...p, [id]: !p[id] }));

  const getLessonIcon = (type: string) => {
    if (type === 'quiz') return HelpCircle;
    if (type === 'reading') return BookOpen;
    return PlayCircle;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'checkpoints', label: 'Checkpoints', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
  ];

  // ── Render: Library ───────────────────────────
  if (view === 'library') {
    return (
      <DashboardLayout activeItem="learning" onNavigate={onNavigate} title="Learning Path">
        {/* Free / Paid Tab Toggle */}
        <div className="flex items-center gap-0 mb-6 border-2 border-black inline-flex">
          <button
            onClick={() => setLibraryTab('free')}
            className={cn(
              'px-6 py-2.5 font-black text-sm uppercase tracking-wider transition-all border-r-2 border-black',
              libraryTab === 'free'
                ? 'bg-brutal-yellow text-black shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)]'
                : 'bg-white text-black/50 hover:bg-gray-50'
            )}
          >
            🎓 Free Courses
          </button>
          <button
            onClick={() => setLibraryTab('paid')}
            className={cn(
              'px-6 py-2.5 font-black text-sm uppercase tracking-wider transition-all',
              libraryTab === 'paid'
                ? 'bg-brutal-purple text-black shadow-[inset_0_-3px_0_0_rgba(0,0,0,0.15)]'
                : 'bg-white text-black/50 hover:bg-gray-50'
            )}
          >
            💎 Paid Courses
          </button>
        </div>

        {libraryTab === 'free' ? (
          <CourseLibrary
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onGenerate={() => setShowGenerateModal(true)}
            onDeleteCourse={deleteCourse}
            isGenerating={isLoadingCurriculum}
            isLoading={!!loadingCourseId}
          />
        ) : (
          <PaidCoursesGrid targetRole={user?.targetRole || ''} />
        )}

        {showGenerateModal && (
          <GenerateModal
            defaultTopic={user?.targetRole || ''}
            onGenerate={handleGenerate}
            onClose={() => setShowGenerateModal(false)}
            isLoading={isLoadingCurriculum}
          />
        )}
      </DashboardLayout>
    );
  }

  // ── Render: Player ────────────────────────────
  const currentCourse = activeCourse;
  if (!currentCourse) {
    setView('library');
    return null;
  }

  const totalLessons = currentCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = currentCourse.modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0);

  return (
    <DashboardLayout activeItem="learning" onNavigate={onNavigate} title="Learning Path">
      <div className="flex gap-6 h-[calc(100vh-130px)]">

        {/* ─── Left: Video + Tabs ─── */}
        <div className={cn(
          'flex flex-col gap-4 transition-all duration-300 min-w-0 overflow-y-auto custom-scrollbar',
          focusMode ? 'flex-1' : isChatOpen ? 'flex-[2]' : 'flex-[3]'
        )}>
          {/* Back to library */}
          <button
            onClick={() => setView('library')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors self-start"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>

          {/* Video Player */}
          <MatrixCard className="flex-shrink-0 p-4" ref={videoRef}>
            <div className={cn('bg-slate-900 rounded-none overflow-hidden mb-4 relative', focusMode ? 'aspect-[21/9]' : 'aspect-video')}>
              {(() => {
                const url = getActiveVideoUrl();
                const vid = url ? getYouTubeEmbedId(url) : null;
                if (vid) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`}
                      title={currentCourse.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-none"
                    />
                  );
                }
                return (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <PlayCircle className="w-16 h-16 text-white/50 mb-3" />
                    <p className="text-white/60 text-sm">Select a lesson to start watching</p>
                  </div>
                );
              })()}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{currentCourse.title}</h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                    <Clock className="w-4 h-4" />{currentCourse.duration}
                  </div>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-500">{completedLessons}/{totalLessons} lessons</span>
                </div>
              </div>
              <div className="flex gap-2">
                <MatrixButton variant="secondary" size="sm">
                  <Download className="w-4 h-4 mr-2" />Resources
                </MatrixButton>
                {!focusMode && (
                  <MatrixButton variant={isChatOpen ? 'primary' : 'ghost'} size="sm" onClick={() => setChatOpen(!isChatOpen)}>
                    <Bot className="w-4 h-4 mr-2" />AI Help
                  </MatrixButton>
                )}
                <MatrixButton variant={focusMode ? 'primary' : 'ghost'} size="sm" onClick={focusMode ? exitFocusMode : enterFocusMode}>
                  {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </MatrixButton>
              </div>
            </div>
          </MatrixCard>

          {/* Tabs */}
          <MatrixCard className="min-h-[300px] flex flex-col overflow-hidden p-4">
            <div className="flex border-b border-slate-100 mb-4 flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn('px-5 py-2.5 text-sm font-bold transition-all relative', activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600')}
                >
                  <div className="flex items-center gap-2"><tab.icon className="w-4 h-4" />{tab.label}</div>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-none" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 leading-relaxed">{currentCourse.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Skills you'll gain</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentCourse.skills.map((s) => <MatrixBadge key={s} variant="accent">{s}</MatrixBadge>)}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'checkpoints' && (
                <div className="space-y-6">
                  {currentCourse.checkpoints.length > 0 ? currentCourse.checkpoints.map((cp) => {
                    const answer = checkpointAnswers[cp.id];
                    const ok = answer === cp.correctAnswer;
                    return (
                      <div key={cp.id} className="p-5 bg-slate-50 rounded-none border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-4">{cp.question}</h4>
                        <div className="space-y-3">
                          {cp.options.map((opt, idx) => (
                            <button key={idx} onClick={() => setCheckpointAnswers({ ...checkpointAnswers, [cp.id]: idx })}
                              className={cn('w-full p-4 rounded-none border text-sm font-medium transition-all text-left',
                                answer === idx ? (ok ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-red-50 border-red-400 text-red-700') : 'bg-white border-slate-100 hover:border-emerald-200')}>{opt}</button>
                          ))}
                        </div>
                        {answer !== undefined && (
                          <div className={cn('mt-4 p-4 rounded-none text-sm', ok ? 'bg-emerald-100/50 text-emerald-700' : 'bg-red-100/50 text-red-700')}>
                            <p className="font-bold mb-1">{ok ? 'Correct!' : 'Not quite right'}</p>
                            {!ok && <p className="text-slate-600">{cp.explanation}</p>}
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-12"><p className="text-slate-400">No checkpoints for this course yet.</p></div>
                  )}

                  <div className="border-t-[3px] border-black pt-6 mt-6">
                    <div className="bg-brutal-blue/10 border-[3px] border-black p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0_0_#000]">
                          <Brain className="w-6 h-6 text-black" />
                        </div>
                        <div>
                          <h4 className="font-black text-lg uppercase tracking-wider mb-1">Knowledge Check</h4>
                          <p className="text-sm font-medium text-black/70 mb-4">Want more practice? Generate an AI-powered quiz on {currentCourse.title} topics now.</p>
                          <MatrixButton onClick={() => setShowQuizModal(currentCourse.title)}>
                            Take Practice Quiz
                          </MatrixButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex bg-slate-100 p-1 rounded-none">
                      {(['edit', 'preview'] as const).map((m) => (
                        <button key={m} onClick={() => setNotesMode(m)}
                          className={cn('px-4 py-1.5 rounded-none text-xs font-bold transition-all capitalize', notesMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                          {m === 'edit' ? 'Write' : 'Preview'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {notesMode === 'edit' ? (
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Take notes…"
                      className="flex-1 w-full bg-slate-50 border border-slate-100 rounded-none p-6 text-slate-900 focus:outline-none focus:border-emerald-400 resize-none font-medium text-sm leading-relaxed" />
                  ) : (
                    <div className="flex-1 p-6 bg-slate-50 rounded-none border border-slate-100 overflow-y-auto">
                      {notes ? <pre className="text-slate-700 whitespace-pre-wrap font-sans">{notes}</pre> : <p className="text-slate-400 text-center py-8">No notes yet.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </MatrixCard>

          {/* Progress + Next button */}
          <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-none flex-shrink-0">
            <span className="text-slate-500 text-sm whitespace-nowrap">Progress</span>
            <MatrixProgress value={currentCourse.progress} className="flex-1" showLabel />
            <div className="flex items-center gap-2">
              {currentLesson && !currentLesson.completed && (
                <MatrixButton variant="secondary" size="sm" onClick={handleMarkDoneAndNext}>
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
                  {nextLesson ? 'Mark Done & Next' : 'Mark Done'}
                  {nextLesson && <ArrowRight className="w-4 h-4 ml-1.5" />}
                </MatrixButton>
              )}
              <MatrixButton onClick={handleComplete} disabled={currentCourse.progress < 100} size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />Complete Course
              </MatrixButton>
            </div>
          </div>
        </div>

        {/* ─── Right: Module Accordion ─── */}
        {!focusMode && (
          <div className="w-[360px] flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-none overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex-shrink-0">
              <h3 className="font-bold text-slate-900 text-sm">Course Content</h3>
              <p className="text-xs text-slate-400 mt-1">
                {currentCourse.modules.length} sections · {totalLessons} lessons · {currentCourse.duration}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {currentCourse.modules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                  <p className="text-slate-400 text-sm">Loading modules…</p>
                </div>
              ) : currentCourse.modules.map((module) => {
                const isExpanded = expandedModules[module.id] ?? false;
                const done = module.lessons.filter((l) => l.completed).length;
                const total = module.lessons.length;
                return (
                  <div key={module.id} className="border-b border-slate-100 last:border-b-0">
                    <button onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn('transition-transform duration-200', isExpanded && 'rotate-90')}>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{module.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{done}/{total} completed</p>
                        </div>
                      </div>
                      {done === total && total > 0 && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="bg-slate-50/50">
                        {module.lessons.map((lesson) => {
                          const LIcon = getLessonIcon(lesson.type);
                          const isActive = selectedLessonId === lesson.id;
                          return (
                            <div key={lesson.id}
                              onClick={() => {
                                if (lesson.url) {
                                  setSelectedLessonUrl(lesson.url);
                                  setSelectedLessonId(lesson.id);
                                }
                              }}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 pl-11 hover:bg-slate-100/60 transition-colors cursor-pointer border-t border-slate-100/60',
                                lesson.completed && 'opacity-60',
                                isActive && 'bg-emerald-50/60 border-l-2 border-l-emerald-500'
                              )}
                            >
                              <div className={cn('w-5 h-5 rounded-none border-2 flex items-center justify-center flex-shrink-0', lesson.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
                                {lesson.completed && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <LIcon className={cn('w-4 h-4 flex-shrink-0', lesson.completed ? 'text-slate-400' : 'text-slate-500')} />
                              <div className="flex-1 min-w-0">
                                <p className={cn('text-xs font-medium truncate', lesson.completed ? 'text-slate-400 line-through' : 'text-slate-700')}>{lesson.title}</p>
                              </div>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">{lesson.duration}</span>
                            </div>
                          );
                        })}
                        {/* Module Assessment Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const videoTitles = module.lessons.map((l) => l.title).join(', ');
                            const topic = `Assessment on: ${module.title} — covering: ${videoTitles}`;
                            setAssessmentModule({ title: module.title, topic });
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 pl-11 bg-amber-50/80 hover:bg-amber-100/80 transition-colors cursor-pointer border-t-2 border-amber-200/60 group/assess"
                        >
                          <div className="w-5 h-5 rounded-none bg-amber-400 border-2 border-amber-600 flex items-center justify-center flex-shrink-0 shadow-[1px_1px_0_0_rgba(0,0,0,0.2)]">
                            <ClipboardCheck className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider group-hover/assess:text-amber-900">Module Assessment</span>
                          <span className="text-[10px] text-amber-500 ml-auto">10 Qs</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Other courses */}
            <div className="border-t border-slate-100 p-4 flex-shrink-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">All courses</p>
              <div className="space-y-2">
                {courses.map((course) => (
                  <button key={course.id} onClick={() => handleSelectCourse(course.id)}
                    className={cn('w-full flex items-center gap-3 p-2 rounded-none hover:bg-slate-50 transition-colors text-left', course.id === currentCourse.id && 'bg-emerald-50')}>
                    <img src={course.thumbnail} alt="" className="w-10 h-7 rounded object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 truncate">{course.title}</p>
                      <p className="text-[10px] text-slate-400">{course.duration}</p>
                    </div>
                    {course.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    {course.id === currentCourse.id && <div className="w-1.5 h-1.5 rounded-none bg-emerald-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Assistant panel */}
        {isChatOpen && !focusMode && (
          <div className="w-[340px] flex-shrink-0 border border-slate-200 rounded-none bg-white shadow-lg flex flex-col overflow-hidden">
            <AIHelper variant="panel" />
          </div>
        )}
      </div>

      {/* Mini-player PiP */}
      {showMiniPlayer && !focusMode && (
        <div className="fixed bottom-6 right-6 z-50 w-72 bg-white border border-slate-200 rounded-none shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="relative">
            <img src={currentCourse.thumbnail} alt="" className="w-full h-20 object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer">
              <PlayCircle className="w-8 h-8 text-white/80" />
            </div>
            <button onClick={() => setShowMiniPlayer(false)} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-none flex items-center justify-center text-white hover:bg-black/70">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-slate-900 truncate">{currentCourse.title}</p>
            <div className="mt-2"><MatrixProgress value={currentCourse.progress} className="h-1" /></div>
          </div>
        </div>
      )}

      {showStreakToast && (
        <StreakToast streak={user?.streak || 1} visible={showStreakToast} onDismiss={() => setShowStreakToast(false)} />
      )}

      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <QuizGenerator topic={showQuizModal} onClose={() => setShowQuizModal(null)} />
          </div>
        </div>
      )}

      {assessmentModule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                  <ClipboardCheck className="w-4 h-4 text-black" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">{assessmentModule.title}</h3>
              </div>
              <button
                onClick={() => setAssessmentModule(null)}
                className="w-8 h-8 bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <QuizGenerator topic={assessmentModule.topic} numQuestions={10} onClose={() => setAssessmentModule(null)} />
          </div>
        </div>
      )}

      {showCertModal && activeCourse && (
        <CertificateModal
          courseId={showCertModal}
          courseName={activeCourse.title}
          onClose={() => {
            setShowCertModal(null);
            setShowLinkedInModal(activeCourse.title);
          }}
        />
      )}

      {showLinkedInModal && activeCourse && (
        <LinkedInPostGenerator
          courseName={showLinkedInModal}
          skillsGained={activeCourse.modules.flatMap(m => m.topics || [])}
          onClose={() => setShowLinkedInModal(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default LearningPage;
