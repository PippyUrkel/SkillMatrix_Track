import React, { useState, useMemo } from 'react';
import { useOnboardingStore } from '@/stores';
import type { RiasecScores } from '@/types';

// ─── RIASEC Questions ─────────────────────────────────────────────────────────
// 5 statements per type, rated 1-5 (Strongly Disagree → Strongly Agree)
interface RiasecQuestion {
    type: keyof RiasecScores;
    statement: string;
}

const QUESTIONS: RiasecQuestion[] = [
    // Realistic (2)
    { type: 'R', statement: 'I enjoy building or fixing things with my hands' },
    { type: 'R', statement: 'I am good at hands-on problem solving' },
    // Investigative (2)
    { type: 'I', statement: 'I like solving complex puzzles and analyzing data' },
    { type: 'I', statement: 'I prefer understanding how and why things work' },
    // Artistic (2)
    { type: 'A', statement: 'I enjoy expressing myself through art, writing, or design' },
    { type: 'A', statement: 'I enjoy creating new ideas, content, or experiences' },
    // Social (2)
    { type: 'S', statement: 'I find it rewarding to help others learn or solve problems' },
    { type: 'S', statement: 'I enjoy working in teams and collaborating' },
    // Enterprising (2)
    { type: 'E', statement: 'I like leading teams and making strategic decisions' },
    { type: 'E', statement: 'I am drawn to entrepreneurial or business ventures' },
    // Conventional (2)
    { type: 'C', statement: 'I prefer organized tasks with clear procedures' },
    { type: 'C', statement: 'I am detail-oriented and enjoy tracking data accurately' },
];

const TYPE_META: Record<keyof RiasecScores, { label: string; color: string; bg: string; emoji: string }> = {
    R: { label: 'Realistic', color: 'border-brutal-orange', bg: 'bg-brutal-orange', emoji: '🔧' },
    I: { label: 'Investigative', color: 'border-brutal-blue', bg: 'bg-brutal-blue', emoji: '🔬' },
    A: { label: 'Artistic', color: 'border-brutal-pink', bg: 'bg-brutal-pink', emoji: '🎨' },
    S: { label: 'Social', color: 'border-brutal-purple', bg: 'bg-brutal-purple', emoji: '🤝' },
    E: { label: 'Enterprising', color: 'border-brutal-yellow', bg: 'bg-brutal-yellow', emoji: '🚀' },
    C: { label: 'Conventional', color: 'border-green-400', bg: 'bg-green-400', emoji: '📊' },
};

const RATING_LABELS = ['Strongly\nDisagree', 'Disagree', 'Neutral', 'Agree', 'Strongly\nAgree'];

export const InterestStep: React.FC = () => {
    const { setRiasecScores, riasecScores } = useOnboardingStore();
    const [answers, setAnswers] = useState<Record<number, number>>({});

    const handleAnswer = (questionIndex: number, rating: number) => {
        const newAnswers = { ...answers, [questionIndex]: rating };
        setAnswers(newAnswers);

        // Calculate scores when all 12 are answered
        if (Object.keys(newAnswers).length === QUESTIONS.length) {
            const scores: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
            QUESTIONS.forEach((q, idx) => {
                scores[q.type] += newAnswers[idx] || 0;
            });
            // Normalize to 0-100 (max = 2 questions × 5 rating = 10)
            (Object.keys(scores) as Array<keyof RiasecScores>).forEach((key) => {
                scores[key] = Math.round((scores[key] / 10) * 100);
            });
            setRiasecScores(scores);
        }
    };

    const answeredCount = Object.keys(answers).length;
    const isComplete = answeredCount === QUESTIONS.length;

    // Group questions by type for rendering
    const groupedQuestions = useMemo(() => {
        const groups: Record<string, { question: RiasecQuestion; index: number }[]> = {};
        QUESTIONS.forEach((q, idx) => {
            if (!groups[q.type]) groups[q.type] = [];
            groups[q.type].push({ question: q, index: idx });
        });
        return groups;
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-block bg-brutal-yellow border-2 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                    <span className="font-black text-black text-sm uppercase tracking-wider">⚡ Interest Discovery</span>
                </div>
                <h2 className="text-2xl font-black text-black uppercase">What drives you?</h2>
                <p className="text-black/60 mt-2 max-w-xl mx-auto">
                    Rate how much you agree with each statement. This helps us align career suggestions with your personal interests using the RIASEC model.
                </p>
            </div>

            {/* Progress */}
            <div className="mb-8 bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-black text-sm uppercase">{answeredCount} / {QUESTIONS.length} Answered</span>
                    <span className="font-bold text-black text-sm">{Math.round((answeredCount / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-100 border-2 border-black">
                    <div
                        className="h-full bg-brutal-yellow transition-all duration-300"
                        style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Questions grouped by type */}
            <div className="space-y-6">
                {(Object.keys(groupedQuestions) as Array<keyof RiasecScores>).map((type) => {
                    const meta = TYPE_META[type];
                    const items = groupedQuestions[type];

                    return (
                        <div key={type} className={`border-2 border-black ${meta.bg}/20 overflow-hidden`}>
                            {/* Type Header */}
                            <div className={`${meta.bg} border-b-2 border-black px-4 py-3 flex items-center gap-3`}>
                                <span className="text-xl">{meta.emoji}</span>
                                <span className="font-black text-black uppercase tracking-wider text-sm">{meta.label}</span>
                            </div>

                            {/* Statements */}
                            <div className="divide-y-2 divide-black">
                                {items.map(({ question, index }) => (
                                    <div key={index} className="px-4 py-4 bg-white">
                                        <p className="text-black font-medium mb-3 text-sm">{question.statement}</p>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    onClick={() => handleAnswer(index, rating)}
                                                    className={`flex-1 py-2 px-1 border-2 border-black text-xs font-bold uppercase transition-all whitespace-pre-line leading-tight ${answers[index] === rating
                                                        ? `${meta.bg} text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`
                                                        : 'bg-white text-black/60 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {RATING_LABELS[rating - 1]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Results Radar (shown after completion) */}
            {isComplete && riasecScores && (
                <div className="mt-8 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <h3 className="font-black text-black uppercase text-lg mb-6 text-center">Your Interest Profile</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {(Object.keys(riasecScores) as Array<keyof RiasecScores>)
                            .sort((a, b) => (riasecScores[b] || 0) - (riasecScores[a] || 0))
                            .map((key) => {
                                const meta = TYPE_META[key];
                                const score = riasecScores[key];
                                return (
                                    <div key={key} className={`border-2 border-black p-4 ${meta.bg}/30`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{meta.emoji}</span>
                                            <span className="font-black text-black text-xs uppercase">{meta.label}</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-100 border border-black mb-1">
                                            <div className={`h-full ${meta.bg} transition-all duration-500`} style={{ width: `${score}%` }} />
                                        </div>
                                        <span className="font-black text-black text-lg">{score}%</span>
                                    </div>
                                );
                            })}
                    </div>
                    <p className="text-center text-black/50 text-sm mt-4 font-medium">
                        Your top interest: <strong className="text-black">
                            {TYPE_META[
                                (Object.keys(riasecScores) as Array<keyof RiasecScores>)
                                    .sort((a, b) => (riasecScores[b] || 0) - (riasecScores[a] || 0))[0]
                            ].label}
                        </strong>
                    </p>
                </div>
            )}
        </div>
    );
};
