import React, { useState } from 'react';
import { useOnboardingStore } from '@/stores';
import { useUserStore } from '@/stores/userStore';
import { StepIndicator } from './StepIndicator';
import { ProfileSetupStep } from './ProfileSetupStep';
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
    saveProfileToBackend,
  } = useOnboardingStore();

  const { updateUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 4;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Must have analyzed GitHub or uploaded resume
        return githubConnected || analysisResult !== null;
      case 2:
        return selectedPath !== '';
      case 3:
        return assessmentComplete;
      case 4:
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
            <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-none animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Setting up your profile...</h3>
          <p className="text-slate-500">Saving your skills and preferences</p>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <ProfileSetupStep />;
      case 2:
        return <PathSelectionStep />;
      case 3:
        return <QuizStep />;
      case 4:
        return <PreferencesStep />;
      default:
        return null;
    }
  };

  const stepLabels = ['Profile Setup', 'Choose Path', 'Knowledge Quiz', 'Preferences'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500 rounded-none shadow-lg shadow-emerald-200 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Let's set up your profile</h1>
          <p className="text-slate-500 mt-1">This helps us create a personalized learning experience</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          labels={stepLabels}
        />

        {/* Step Content */}
        <div className="mt-8 bg-white rounded-none shadow-sm border border-slate-200 p-8">
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
