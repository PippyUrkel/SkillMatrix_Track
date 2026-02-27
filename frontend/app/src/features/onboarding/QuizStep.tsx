import React, { useState } from 'react';
import { useOnboardingStore } from '@/stores';
import { MatrixProgress } from '@/components/ui/MatrixProgress';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language'
    ],
    correctAnswer: 0,
    explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.',
  },
  {
    id: 2,
    question: 'Which of the following is NOT a JavaScript data type?',
    options: [
      'Number',
      'String',
      'Float',
      'Boolean'
    ],
    correctAnswer: 2,
    explanation: 'JavaScript does not have a Float type. It uses Number for all numeric values, including integers and decimals.',
  },
  {
    id: 3,
    question: 'What is the purpose of CSS?',
    options: [
      'To add interactivity to web pages',
      'To style and layout web pages',
      'To store data on the server',
      'To handle user authentication'
    ],
    correctAnswer: 1,
    explanation: 'CSS (Cascading Style Sheets) is used to style and layout web pages, including colors, fonts, and spacing.',
  },
  {
    id: 4,
    question: 'Which HTTP method is used to retrieve data from a server?',
    options: [
      'POST',
      'PUT',
      'GET',
      'DELETE'
    ],
    correctAnswer: 2,
    explanation: 'The GET method is used to request data from a specified resource on the server.',
  },
  {
    id: 5,
    question: 'What is Git used for?',
    options: [
      'Writing code faster',
      'Version control and collaboration',
      'Hosting websites',
      'Database management'
    ],
    correctAnswer: 1,
    explanation: 'Git is a distributed version control system that helps developers track changes and collaborate on code.',
  },
];

export const QuizStep: React.FC = () => {
  const { assessmentAnswers, setAssessmentAnswer, setAssessmentComplete, assessmentComplete } = useOnboardingStore();
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAssessmentAnswer(questionId - 1, answerIndex);
    setShowResults({ ...showResults, [questionId]: true });

    // Check if all questions are answered
    const newAnswers = [...assessmentAnswers];
    newAnswers[questionId - 1] = answerIndex;
    
    if (newAnswers.filter(a => a !== undefined).length === QUESTIONS.length) {
      setAssessmentComplete(true);
    }

    // Auto-advance after a short delay
    if (currentQuestion < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 1500);
    }
  };

  const progress = ((assessmentAnswers.filter(a => a !== undefined).length) / QUESTIONS.length) * 100;
  const score = assessmentAnswers.reduce((acc, answer, idx) => {
    return acc + (answer === QUESTIONS[idx].correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Knowledge Assessment</h2>
        <p className="text-slate-500">
          Answer these questions so we can tailor your learning experience
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <MatrixProgress value={progress} className="flex-1" />
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {assessmentAnswers.filter(a => a !== undefined).length} / {QUESTIONS.length}
        </span>
      </div>

      {/* Score Display (when complete) */}
      {assessmentComplete && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-none text-center">
          <p className="text-emerald-700 font-medium">
            Quiz Complete! You scored {score}/{QUESTIONS.length}
          </p>
          <p className="text-emerald-600 text-sm mt-1">
            We'll use this to create your personalized course
          </p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {QUESTIONS.map((question, qIndex) => {
          const hasAnswered = assessmentAnswers[question.id - 1] !== undefined;
          const isCorrect = hasAnswered && assessmentAnswers[question.id - 1] === question.correctAnswer;
          const showResult = showResults[question.id];

          return (
            <div
              key={question.id}
              className={cn(
                'p-5 rounded-none border transition-all',
                qIndex === currentQuestion || hasAnswered
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-none flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {question.id}
                </span>
                <h3 className="font-medium text-slate-900">{question.question}</h3>
              </div>

              <div className="space-y-2 ml-10">
                {question.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => !hasAnswered && handleAnswer(question.id, optIndex)}
                    disabled={hasAnswered}
                    className={cn(
                      'w-full p-3 rounded-none text-left text-sm transition-all border',
                      showResult && optIndex === question.correctAnswer
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : showResult && optIndex === assessmentAnswers[question.id - 1] && !isCorrect
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : hasAnswered
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {showResult && optIndex === question.correctAnswer && (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      )}
                      {showResult && optIndex === assessmentAnswers[question.id - 1] && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className={cn(
                  'mt-3 ml-10 p-3 rounded-none text-sm',
                  isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                )}>
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>{question.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
