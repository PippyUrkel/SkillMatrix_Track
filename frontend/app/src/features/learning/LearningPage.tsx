import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { StreakToast } from '@/components/ui/StreakToast';
import { useDashboardStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { AIHelper } from '@/features/aihelper';
import confetti from 'canvas-confetti';

interface LearningPageProps {
  onNavigate: (path: string) => void;
}

// ─── Course Library (card grid) ───────────────────────────────────────────────
const CourseLibrary: React.FC<{
  courses: any[];
  onSelectCourse: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  isLoading: boolean;
}> = ({ courses, onSelectCourse, onGenerate, isGenerating, isLoading }) => (
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
              className="group cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all duration-200 overflow-hidden p-0"
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
  </div>
);

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
  } = useDashboardStore();

  const { addXP, user } = useUserStore();

  // ── View state ────────────────────────────────
  const [view, setView] = useState<'library' | 'player'>('library');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#2EE9A8', '#00CC33', '#F2FFF8'] });
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
        <CourseLibrary
          courses={courses}
          onSelectCourse={handleSelectCourse}
          onGenerate={() => setShowGenerateModal(true)}
          isGenerating={isLoadingCurriculum}
          isLoading={!!loadingCourseId}
        />
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

      <StreakToast streak={user?.streak || 1} visible={showStreakToast} onDismiss={() => setShowStreakToast(false)} />
    </DashboardLayout>
  );
};

export default LearningPage;
