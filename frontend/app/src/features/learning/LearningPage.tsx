import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
import { MatrixBadge } from '@/components/ui/MatrixBadge';
import { useDashboardStore, useUserStore } from '@/stores';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  MessageSquare,
  FileText,
  Info,
  ChevronRight,
  Sparkles,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LearningPageProps {
  onNavigate: (path: string) => void;
}

export const LearningPage: React.FC<LearningPageProps> = ({ onNavigate }) => {
  const { courses, activeCourse, setActiveCourse, completeCourse } = useDashboardStore();
  const { addXP } = useUserStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'checkpoints' | 'ai' | 'notes'>('overview');
  const [notes, setNotes] = useState('');
  const [notesMode, setNotesMode] = useState<'edit' | 'preview'>('edit');
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string, number>>({});
  const [showCheckpointResult, setShowCheckpointResult] = useState<Record<string, boolean>>({});

  const currentCourse = activeCourse || courses[0];

  const handleComplete = () => {
    completeCourse(currentCourse.id);
    addXP(150);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6EE7B7'],
    });
  };

  const handleCheckpointAnswer = (checkpointId: string, answer: number) => {
    setCheckpointAnswers((prev) => ({ ...prev, [checkpointId]: answer }));
    setShowCheckpointResult((prev) => ({ ...prev, [checkpointId]: true }));
  };

  const exportNotes = () => {
    const blob = new Blob([notes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCourse.title}-notes.md`;
    a.click();
  };

  return (
    <DashboardLayout activeItem="learning" onNavigate={onNavigate} title="Learning Path">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
        {/* Left Sidebar - Course Queue */}
        <MatrixCard className="lg:col-span-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Your Path</h3>
            <MatrixButton variant="ghost" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate
            </MatrixButton>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {courses.map((course, index) => {
              const isActive = course.id === currentCourse?.id;
              const isCompleted = course.status === 'completed';

              return (
                <button
                  key={course.id}
                  onClick={() => setActiveCourse(course)}
                  className={cn(
                    'w-full p-3 rounded-xl border-l-2 text-left transition-all',
                    isActive
                      ? 'bg-emerald-50 border-emerald-500'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100',
                    isCompleted && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        )}
                      >
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{course.duration}</span>
                        {course.status === 'in_progress' && (
                          <MatrixBadge variant="accent" size="sm">
                            {course.progress}%
                          </MatrixBadge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </MatrixCard>

        {/* Right Panel - Course Viewer */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Video Player */}
          <MatrixCard className="flex-shrink-0">
            <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`}
                title={currentCourse.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{currentCourse.title}</h2>
                <p className="text-slate-500">{currentCourse.channel} • {currentCourse.duration}</p>
              </div>
              <MatrixButton variant="secondary" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Save for later
              </MatrixButton>
            </div>
          </MatrixCard>

          {/* Tabs */}
          <MatrixCard className="flex-1 overflow-hidden flex flex-col">
            <div className="flex border-b border-slate-200 mb-4">
              {[
                { id: 'overview', label: 'Overview', icon: Info },
                { id: 'checkpoints', label: 'Checkpoints', icon: CheckCircle },
                { id: 'ai', label: 'AI Helper', icon: MessageSquare },
                { id: 'notes', label: 'Notes', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'text-emerald-600 border-emerald-500'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-slate-900 font-semibold mb-2">About this course</h4>
                    <p className="text-slate-600">{currentCourse.description}</p>
                  </div>

                  <div>
                    <h4 className="text-slate-900 font-semibold mb-3">Skills you'll learn</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCourse.skills.map((skill) => (
                        <MatrixBadge key={skill} variant="accent">
                          {skill}
                        </MatrixBadge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-slate-900 font-semibold mb-3">Complementary skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCourse.complementarySkills.map((skill) => (
                        <span key={skill} className="text-sm text-slate-500">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'checkpoints' && (
                <div className="space-y-4">
                  {currentCourse.checkpoints.length > 0 ? (
                    currentCourse.checkpoints.map((checkpoint, idx) => {
                      const hasAnswered = checkpointAnswers[checkpoint.id] !== undefined;
                      const isCorrect = hasAnswered && checkpointAnswers[checkpoint.id] === checkpoint.correctAnswer;
                      const showResult = showCheckpointResult[checkpoint.id];

                      return (
                        <div key={checkpoint.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-slate-900 font-medium mb-4">
                            {idx + 1}. {checkpoint.question}
                          </p>
                          <div className="space-y-2">
                            {checkpoint.options.map((option, optIdx) => (
                              <button
                                key={optIdx}
                                disabled={hasAnswered}
                                onClick={() => handleCheckpointAnswer(checkpoint.id, optIdx)}
                                className={cn(
                                  'w-full p-3 rounded-lg text-left transition-colors border',
                                  showResult && optIdx === checkpoint.correctAnswer
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : showResult && optIdx === checkpointAnswers[checkpoint.id] && !isCorrect
                                    ? 'bg-red-50 border-red-400 text-red-700'
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                                )}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                          {showResult && (
                            <div className={cn(
                              'mt-3 p-3 rounded-lg',
                              isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            )}>
                              <p>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                              {!isCorrect && (
                                <p className="text-sm mt-1">{checkpoint.explanation}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No checkpoints available for this course yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 rounded-xl rounded-tl-none p-4 max-w-[80%]">
                        <p className="text-slate-700">What is the time complexity of quicksort?</p>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                      <div className="bg-emerald-500 rounded-xl rounded-tr-none p-4 max-w-[80%]">
                        <p className="text-white">O(n log n) on average.</p>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">You</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-100 rounded-xl rounded-tl-none p-4 max-w-[80%]">
                        <p className="text-slate-700">Correct! Want a quick practice problem?</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask anything about this course..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                    <MatrixButton>
                      <ChevronRight className="w-5 h-5" />
                    </MatrixButton>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNotesMode('edit')}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          notesMode === 'edit'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setNotesMode('preview')}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          notesMode === 'preview'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                      >
                        Preview
                      </button>
                    </div>
                    <MatrixButton variant="ghost" size="sm" onClick={exportNotes}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </MatrixButton>
                  </div>

                  {notesMode === 'edit' ? (
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Take notes here... (Markdown supported)"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 p-4 rounded-xl resize-none focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <div className="flex-1 bg-slate-50 border border-slate-200 p-4 rounded-xl overflow-auto">
                      {notes ? (
                        <pre className="text-slate-700 whitespace-pre-wrap">{notes}</pre>
                      ) : (
                        <p className="text-slate-400">No notes yet. Start typing in edit mode.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </MatrixCard>

          {/* Progress Bar */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-slate-500 text-sm whitespace-nowrap">Course Progress</span>
            <MatrixProgress value={currentCourse.progress} className="flex-1" showLabel />
            <MatrixButton
              onClick={handleComplete}
              disabled={currentCourse.progress < 100}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Complete
            </MatrixButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
