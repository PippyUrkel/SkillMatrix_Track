import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/stores';
import { Brain, Search, PlayCircle, Check, BookOpen } from 'lucide-react';
import { QuizGenerator } from './QuizGenerator';

export const QuizPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { courses, fetchCourseDetail } = useDashboardStore();
    const [search, setSearch] = useState('');

    // Selection state
    const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
    const [numQuestions, setNumQuestions] = useState(5);
    const [isQuizStarted, setIsQuizStarted] = useState(false);

    // Fetch details for all courses so we have their modules & completed lessons
    useEffect(() => {
        courses.forEach(c => {
            if ((c.status === 'in_progress' || c.status === 'completed') && (!c.modules || c.modules.length === 0)) {
                fetchCourseDetail(c.id);
            }
        });
    }, [courses, fetchCourseDetail]);

    // Group completed topics by course
    const coursesWithTopics = React.useMemo(() => {
        const result: { courseName: string; topics: { id: string; title: string; }[] }[] = [];

        courses.forEach(c => {
            const courseTopics: { id: string; title: string; }[] = [];
            c.modules?.forEach(m => {
                m.lessons?.forEach(l => {
                    if (l.completed) {
                        // De-duplicate topics within the same course
                        if (!courseTopics.some(t => t.title === l.title)) {
                            courseTopics.push({ id: l.id, title: l.title });
                        }
                    }
                });
            });
            if (courseTopics.length > 0) {
                result.push({ courseName: c.title, topics: courseTopics });
            }
        });
        return result;
    }, [courses]);

    const handleToggleTopic = (topicTitle: string) => {
        setSelectedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topicTitle)) {
                next.delete(topicTitle);
            } else {
                next.add(topicTitle);
            }
            return next;
        });
    };

    const handleSelectAllInCourse = (courseTopics: { title: string }[]) => {
        setSelectedTopics(prev => {
            const next = new Set(prev);
            const allSelected = courseTopics.every(t => next.has(t.title));
            courseTopics.forEach(t => {
                if (allSelected) {
                    next.delete(t.title);
                } else {
                    next.add(t.title);
                }
            });
            return next;
        });
    };

    return (
        <DashboardLayout activeItem="quizzes" onNavigate={onNavigate} title="Practice Quizzes">
            {isQuizStarted ? (
                <div className="max-w-4xl mx-auto py-6">
                    <button
                        onClick={() => setIsQuizStarted(false)}
                        className="mb-6 text-sm font-bold text-black/50 hover:text-black uppercase tracking-wider"
                    >
                        ← Back to Topic Selection
                    </button>
                    <QuizGenerator
                        topics={Array.from(selectedTopics)}
                        numQuestions={numQuestions}
                        onClose={() => setIsQuizStarted(false)}
                    />
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl mx-auto pb-24">
                    <div className="bg-brutal-yellow border-[3px] border-black p-8 shadow-[6px_6px_0_0_#000]">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#000]">
                                <Brain className="w-8 h-8 text-black" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Knowledge Check</h1>
                                <p className="text-black/80 font-bold max-w-xl">
                                    Test your retention. Select any combination of topics you've completed across your courses, choose how many questions you want, and generate a customized AI quiz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Topic Selection Column */}
                        <div className="flex-1 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                                <input
                                    type="text"
                                    placeholder="Filter courses or topics..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:-translate-y-0.5 transition-all"
                                />
                            </div>

                            {coursesWithTopics.length === 0 ? (
                                <div className="text-center py-20 border-2 border-black border-dashed bg-white">
                                    <PlayCircle className="w-12 h-12 mx-auto text-black/20 mb-4" />
                                    <h3 className="font-black text-xl mb-2 text-black/40">No Completed Topics Yet</h3>
                                    <p className="text-black/50 font-bold text-sm">Finish some lessons in your courses to unlock practice quizzes.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {coursesWithTopics.filter(c =>
                                        c.courseName.toLowerCase().includes(search.toLowerCase()) ||
                                        c.topics.some(t => t.title.toLowerCase().includes(search.toLowerCase()))
                                    ).map((course, idx) => {
                                        const allSelected = course.topics.every(t => selectedTopics.has(t.title));
                                        return (
                                            <div key={idx} className="bg-white border-[3px] border-black shadow-[4px_4px_0_0_#000]">
                                                {/* Course Header */}
                                                <div className="bg-black text-white p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <BookOpen className="w-5 h-5" />
                                                        <h3 className="font-black uppercase tracking-wider">{course.courseName}</h3>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectAllInCourse(course.topics)}
                                                        className="text-xs font-bold px-3 py-1 bg-white text-black border-2 border-transparent hover:border-black hover:bg-brutal-yellow transition-colors"
                                                    >
                                                        {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
                                                    </button>
                                                </div>

                                                {/* Topics List */}
                                                <div className="divide-y-2 divide-black/10">
                                                    {course.topics.filter(t => t.title.toLowerCase().includes(search.toLowerCase())).map(topic => {
                                                        const isSelected = selectedTopics.has(topic.title);
                                                        return (
                                                            <div
                                                                key={topic.id}
                                                                onClick={() => handleToggleTopic(topic.title)}
                                                                className={cn(
                                                                    "p-4 flex items-center gap-4 cursor-pointer transition-colors hover:bg-slate-50",
                                                                    isSelected ? "bg-brutal-yellow/10" : ""
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "w-6 h-6 border-2 border-black flex items-center justify-center shrink-0 transition-colors",
                                                                    isSelected ? "bg-black text-white" : "bg-white"
                                                                )}>
                                                                    {isSelected && <Check className="w-4 h-4" />}
                                                                </div>
                                                                <span className="font-bold text-sm md:text-base flex-1">{topic.title}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Quiz Configuration Sidebar */}
                        <div className="w-full md:w-80 shrink-0">
                            <div className="sticky top-6">
                                <MatrixCard className="p-6 border-[3px] border-black shadow-[6px_6px_0_0_#000] bg-white">
                                    <h3 className="font-black text-xl uppercase tracking-widest mb-6 border-b-2 border-black pb-4">Quiz Setup</h3>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-bold text-sm uppercase text-slate-500">Selected Topics</label>
                                                <span className="font-black text-xl">{selectedTopics.size}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 border border-black overflow-hidden">
                                                <div className="h-full bg-brutal-purple transition-all" style={{ width: selectedTopics.size > 0 ? '100%' : '0%' }} />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="font-bold text-sm uppercase text-slate-500">Number of Questions</label>
                                                <span className="font-black text-xl">{numQuestions}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="1"
                                                max="20"
                                                value={numQuestions}
                                                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                                className="w-full h-2 bg-slate-100 border border-black appearance-none cursor-pointer accent-black"
                                            />
                                            <div className="flex justify-between text-xs font-bold text-slate-400 mt-2">
                                                <span>1</span>
                                                <span>20</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-4 border-t-2 border-black/10">
                                            <MatrixButton
                                                className="w-full py-4 text-lg"
                                                onClick={() => setIsQuizStarted(true)}
                                                disabled={selectedTopics.size === 0}
                                            >
                                                Generate Quiz
                                            </MatrixButton>
                                            {selectedTopics.size === 0 && (
                                                <p className="text-center text-xs font-bold text-red-500 mt-3">
                                                    Select at least one topic to continue
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </MatrixCard>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
