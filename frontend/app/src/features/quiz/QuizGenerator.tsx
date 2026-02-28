import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { MatrixCard } from '@/components/ui/MatrixCard';
import { Brain, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import confetti from 'canvas-confetti';

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

interface QuizGeneratorProps {
    topic: string;
    onClose?: () => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ topic, onClose }) => {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await api.post<{ topic: string, questions: QuizQuestion[] }>('/api/quiz/generate', {
                topic,
                difficulty: 'medium',
                num_questions: 5
            });
            setQuestions(res.questions);
            setCurrentIdx(0);
            setSelectedAnswers({});
            setIsFinished(false);
        } catch (err) {
            console.error("Failed to generate quiz", err);
            alert("Failed to generate quiz. Is Ollama running?");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSelectOption = (opt: string) => {
        if (isFinished) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questions[currentIdx].id]: opt
        }));
    };

    const currentQ = questions[currentIdx];
    const hasSelected = !!selectedAnswers[currentQ?.id];

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setIsFinished(true);
        let score = 0;
        questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correct_answer) score++;
        });
        const percentage = score / questions.length;
        if (percentage >= 0.8) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    if (!questions.length) {
        return (
            <MatrixCard className="text-center py-12">
                <div className="w-16 h-16 bg-brutal-yellow border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0_0_#000]">
                    <Brain className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-black mb-2">Knowledge Check</h3>
                <p className="text-sm font-bold text-black/60 mb-6 max-w-sm mx-auto">
                    Generate a custom 5-question AI quiz to test your understanding of "{topic}".
                </p>
                <MatrixButton onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                    {isGenerating ? 'Generating Quiz...' : 'Generate AI Quiz'}
                </MatrixButton>
            </MatrixCard>
        );
    }

    if (isFinished) {
        let score = 0;
        questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correct_answer) score++;
        });
        const pass = score / questions.length >= 0.8;

        return (
            <MatrixCard className="p-8">
                <div className="text-center mb-8">
                    <h3 className={cn("text-3xl font-black uppercase tracking-widest mb-2", pass ? "text-emerald-500" : "text-amber-500")}>
                        {pass ? "Great Job!" : "Keep Practicing"}
                    </h3>
                    <p className="text-lg font-bold">You scored {score} out of {questions.length}</p>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {questions.map((q, idx) => {
                        const isCorrect = selectedAnswers[q.id] === q.correct_answer;
                        return (
                            <div key={q.id} className="p-4 bg-slate-50 border-2 border-black">
                                <div className="flex gap-3 mb-2">
                                    {isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                    <h4 className="font-bold text-sm">Q{idx + 1}: {q.question}</h4>
                                </div>
                                <p className="text-xs text-black/60 font-bold mb-2">Your answer: {selectedAnswers[q.id]}</p>
                                {!isCorrect && <p className="text-xs text-emerald-600 font-bold mb-2">Correct answer: {q.correct_answer}</p>}
                                <div className="bg-white p-3 border border-slate-200 mt-2 text-xs">
                                    <span className="font-black uppercase text-[10px] tracking-wider text-black/40 block mb-1">Explanation</span>
                                    {q.explanation}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-4 mt-8 justify-center">
                    <MatrixButton variant="secondary" onClick={() => { setQuestions([]); setIsFinished(false); }}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Retry Area
                    </MatrixButton>
                    {onClose && <MatrixButton onClick={onClose}>Complete</MatrixButton>}
                </div>
            </MatrixCard>
        );
    }

    return (
        <MatrixCard className="p-6 md:p-8 relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brutal-yellow border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_#000]">
                        <span className="font-black text-xs">{currentIdx + 1}/{questions.length}</span>
                    </div>
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-sm">Quiz</h3>
                        <p className="text-xs font-bold text-black/50 truncate max-w-[200px]">{topic}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-black leading-tight mb-6">
                    {currentQ.question}
                </h2>

                <div className="space-y-3">
                    {currentQ.options.map((opt, i) => {
                        const isSelected = selectedAnswers[currentQ.id] === opt;
                        const letter = String.fromCharCode(65 + i);
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelectOption(opt)}
                                className={cn(
                                    "w-full text-left p-4 border-[3px] transition-all flex items-center gap-4",
                                    isSelected
                                        ? "border-black bg-brutal-yellow shadow-[4px_4px_0_0_#000] -translate-y-1"
                                        : "border-black/20 hover:border-black/50 bg-white"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center font-black text-sm",
                                    isSelected ? "bg-black text-white" : "bg-black/5 text-black"
                                )}>
                                    {letter}
                                </div>
                                <span className="font-bold text-sm">{opt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t-4 border-black">
                <MatrixButton
                    onClick={handleNext}
                    disabled={!hasSelected}
                >
                    {currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </MatrixButton>
            </div>
        </MatrixCard>
    );
};
