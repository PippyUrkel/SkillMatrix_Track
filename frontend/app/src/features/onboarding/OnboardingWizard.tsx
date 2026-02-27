import React, { useState } from 'react';
import { useOnboardingStore } from '@/stores';
import { useUserStore } from '@/stores/userStore';
import { StepIndicator } from './StepIndicator';
import { ProfileSetupStep } from './ProfileSetupStep';
import { InterestStep } from './InterestStep';
import { PathSelectionStep } from './PathSelectionStep';
import { QuizStep } from './QuizStep';
import { PreferencesStep } from './PreferencesStep';
import { MatrixButton } from '@/components/ui/MatrixButton';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const {
    currentStep,
    setCurrentStep,
    githubConnected,
    selectedPath,
    assessmentComplete,
    analysisResult,
    riasecScores,
    saveProfileToBackend,
  } = useOnboardingStore();

  const { updateUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 5;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Must have analyzed GitHub or uploaded resume
        return githubConnected || analysisResult !== null;
      case 2:
        // Must have completed RIASEC questionnaire
        return riasecScores !== null;
      case 3:
        return selectedPath !== '';
      case 4:
        return assessmentComplete;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      // Final step: save everything to backend
      setIsSaving(true);
      try {
        await saveProfileToBackend();
        // Update local user state with selected role
        updateUser({ targetRole: selectedPath });
        onComplete();
      } catch (error) {
        console.error('Failed to save profile:', error);
        // Still complete onboarding even if save fails — data is in stores
        onComplete();
      } finally {
        setIsSaving(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    if (isSaving) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-brutal-yellow/30 border-t-brutal-yellow rounded-none animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-black" />
          </div>
          <h3 className="text-2xl font-black text-black uppercase mb-2">Setting up your profile...</h3>
          <p className="text-black/60 font-medium">Saving your skills, interests, and preferences</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <ProfileSetupStep />;
      case 2:
        return <InterestStep />;
      case 3:
        return <PathSelectionStep />;
      case 4:
        return <QuizStep />;
      case 5:
        return <PreferencesStep />;
      default:
        return null;
    }
  };

  const stepLabels = ['Profile Setup', 'Interests', 'Choose Path', 'Knowledge Quiz', 'Preferences'];

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brutal-yellow border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase">Let's set up your profile</h1>
          <p className="text-black/60 mt-1 font-medium">This helps us create a personalized learning experience</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          labels={stepLabels}
        />

        {/* Step Content */}
        <div className="mt-8 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {!isSaving && (
          <div className="flex items-center justify-between mt-8">
            <MatrixButton
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </MatrixButton>

            <MatrixButton
              onClick={handleNext}
              disabled={!canProceed()}
              loading={isSaving}
              variant={currentStep === totalSteps ? 'primary' : 'secondary'}
            >
              {currentStep === totalSteps ? 'Start Learning' : 'Next'}
              {currentStep !== totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
            </MatrixButton>
          </div>
        )}
      </div>
    </div>
  );
};
