import React from 'react';
import { useOnboardingStore } from '@/stores';
import { cn } from '@/lib/utils';
import { Volume2, Globe, Share2, Check } from 'lucide-react';

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Chinese',
  'Japanese',
  'Korean',
  'Portuguese',
  'Russian',
  'Hindi',
];

export const PreferencesStep: React.FC = () => {
  const {
    voiceGuided,
    toggleVoiceGuided,
    language,
    setLanguage,
    autoPostLinkedIn,
    toggleAutoPostLinkedIn,
  } = useOnboardingStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Personalize Your Experience</h2>
        <p className="text-slate-500">
          Configure your preferences to get the most out of SkillMatrix
        </p>
      </div>

      {/* Preferences Grid */}
      <div className="space-y-4">
        {/* Voice Guided Learning */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Voice-Guided Learning</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Listen to course content and AI explanations
                </p>
              </div>
            </div>
            <button
              onClick={toggleVoiceGuided}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                voiceGuided ? 'bg-emerald-500' : 'bg-slate-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                  voiceGuided && 'translate-x-6'
                )}
              />
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Language</h3>
              <p className="text-sm text-slate-500 mt-1">
                Choose your preferred language for the platform
              </p>
            </div>
          </div>
          
          <div className="ml-14 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  language === lang
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Post to LinkedIn */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#0077B5] bg-opacity-10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-[#0077B5]" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900">Share Progress on LinkedIn</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Automatically share milestones and achievements
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoPostLinkedIn}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                autoPostLinkedIn ? 'bg-emerald-500' : 'bg-slate-200'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm',
                  autoPostLinkedIn && 'translate-x-6'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-emerald-900">You're all set!</h3>
            <p className="text-sm text-emerald-700 mt-1">
              Click "Start Learning" to begin your personalized course based on your quiz results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
