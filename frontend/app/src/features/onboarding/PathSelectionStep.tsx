import React from 'react';
import { useOnboardingStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Clock, BookOpen, TrendingUp, Code, Database, Server, Shield, Smartphone } from 'lucide-react';

interface CareerPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  courses: number;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: React.ElementType;
  color: string;
}

const CAREER_PATHS: CareerPath[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Master modern web development with React, TypeScript, and CSS frameworks. Build beautiful, responsive user interfaces.',
    duration: '3 months',
    courses: 8,
    skills: ['React', 'TypeScript', 'CSS', 'Tailwind'],
    difficulty: 'beginner',
    icon: Code,
    color: 'bg-blue-500',
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Learn server-side programming, APIs, databases, and system design. Build scalable backend systems.',
    duration: '4 months',
    courses: 10,
    skills: ['Node.js', 'Python', 'SQL', 'System Design'],
    difficulty: 'intermediate',
    icon: Server,
    color: 'bg-emerald-500',
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'Become a versatile developer who can work on both frontend and backend. Complete end-to-end development.',
    duration: '6 months',
    courses: 15,
    skills: ['React', 'Node.js', 'Database', 'DevOps'],
    difficulty: 'advanced',
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    id: 'data',
    title: 'Data Scientist',
    description: 'Learn data analysis, machine learning, and statistical modeling. Extract insights from complex datasets.',
    duration: '5 months',
    courses: 12,
    skills: ['Python', 'ML', 'Statistics', 'SQL'],
    difficulty: 'intermediate',
    icon: Database,
    color: 'bg-orange-500',
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    description: 'Build native and cross-platform mobile applications for iOS and Android devices.',
    duration: '4 months',
    courses: 9,
    skills: ['React Native', 'Swift', 'Kotlin', 'Flutter'],
    difficulty: 'intermediate',
    icon: Smartphone,
    color: 'bg-pink-500',
  },
  {
    id: 'security',
    title: 'Security Engineer',
    description: 'Learn cybersecurity fundamentals, ethical hacking, and secure coding practices.',
    duration: '5 months',
    courses: 11,
    skills: ['Security', 'Networking', 'Cryptography', 'Penetration Testing'],
    difficulty: 'advanced',
    icon: Shield,
    color: 'bg-red-500',
  },
];

export const PathSelectionStep: React.FC = () => {
  const { selectedPath, setSelectedPath } = useOnboardingStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Path</h2>
        <p className="text-slate-500">
          Select a career path that aligns with your goals. You can always switch later.
        </p>
      </div>

      {/* Path Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CAREER_PATHS.map((path) => {
          const isSelected = selectedPath === path.id;
          const Icon = path.icon;

          return (
            <div
              key={path.id}
              onClick={() => setSelectedPath(path.id)}
              className={cn(
                'relative p-5 rounded-none border-2 cursor-pointer transition-all',
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-none flex items-center justify-center flex-shrink-0', path.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{path.title}</h3>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-none font-medium',
                      path.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                      path.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700',
                      path.difficulty === 'advanced' && 'bg-red-100 text-red-700',
                    )}>
                      {path.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{path.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {path.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {path.courses} courses
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {path.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-none flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-none">
        <div className="w-5 h-5 bg-amber-500 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <p className="text-sm text-amber-700">
          After selecting a path, you'll take a short quiz to assess your current knowledge. 
          This helps us create a personalized course just for you.
        </p>
      </div>
    </div>
  );
};
