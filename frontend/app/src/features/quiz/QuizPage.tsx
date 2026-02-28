import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { useDashboardStore } from '@/stores';
import { Brain, Search, PlayCircle } from 'lucide-react';
import { QuizGenerator } from './QuizGenerator';

export const QuizPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { courses } = useDashboardStore();
    const [search, setSearch] = useState('');
    const [activeQuizTopic, setActiveQuizTopic] = useState<string | null>(null);

    // Extract all completed lessons/topics to quiz on
    const completedTopics = React.useMemo(() => {
        const topics: { id: string; title: string; courseName: string }[] = [];
        courses.forEach(c => {
            c.modules?.forEach(m => {
                m.lessons?.forEach(l => {
                    if (l.completed) {
                        topics.push({ id: l.id, title: l.title, courseName: c.title });
                    }
                });
            });
        });
        // Remove duplicates by title
        const unique = new Map<string, typeof topics[0]>();
        topics.forEach(t => unique.set(t.title, t));
        return Array.from(unique.values());
    }, [courses]);

    const filteredTopics = completedTopics.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.courseName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout activeItem="quizzes" onNavigate={onNavigate} title="Practice Quizzes">
            {activeQuizTopic ? (
                <div className="max-w-4xl mx-auto py-6">
                    <button
                        onClick={() => setActiveQuizTopic(null)}
                        className="mb-6 text-sm font-bold text-black/50 hover:text-black uppercase tracking-wider"
                    >
                        ← Back to Topics
                    </button>
                    <QuizGenerator topic={activeQuizTopic} onClose={() => setActiveQuizTopic(null)} />
                </div>
            ) : (
                <div className="space-y-6 max-w-5xl mx-auto">
                    <div className="bg-brutal-yellow border-[3px] border-black p-8 shadow-[6px_6px_0_0_#000]">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-white border-[3px] border-black flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#000]">
                                <Brain className="w-8 h-8 text-black" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Knowledge Check</h1>
                                <p className="text-black/80 font-bold max-w-xl">
                                    Test your retention. Select any topic you've completed across your courses to generate a personalized AI practice quiz.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                            <input
                                type="text"
                                placeholder="Search completed topics..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0_0_#000] focus:-translate-y-0.5 transition-all"
                            />
                        </div>
                    </div>

                    {completedTopics.length === 0 ? (
                        <div className="text-center py-20 border-2 border-black border-dashed bg-white">
                            <PlayCircle className="w-12 h-12 mx-auto text-black/20 mb-4" />
                            <h3 className="font-black text-xl mb-2 text-black/40">No Completed Topics Yet</h3>
                            <p className="text-black/50 font-bold text-sm">Finish some lessons in your courses to unlock practice quizzes.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTopics.map((topic) => (
                                <MatrixCard
                                    key={topic.id}
                                    className="cursor-pointer hover:-translate-y-1 transition-transform group"
                                    onClick={() => setActiveQuizTopic(topic.title)}
                                >
                                    <div className="p-4">
                                        <div className="bg-black text-white text-[10px] uppercase font-black px-2 py-1 inline-block mb-3 border border-black shadow-[2px_2px_0_0_#000]">
                                            {topic.courseName}
                                        </div>
                                        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-brutal-purple transition-colors line-clamp-2">
                                            {topic.title}
                                        </h3>
                                        <p className="text-xs font-bold text-black/40 uppercase tracking-widest mt-4">
                                            Tap to Quiz →
                                        </p>
                                    </div>
                                </MatrixCard>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};
