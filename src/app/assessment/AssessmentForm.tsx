'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  HydratedFormConfig,
  HydratedSection,
  HydratedFormQuestion,
  FormResultsConfig,
} from '@/types/form-config';
import ProgressBar from './components/ProgressBar';
import TopBar from './components/TopBar';
import SectionIntro from './components/SectionIntro';
import NavigationButtons from './components/NavigationButtons';
import ResultsScreen from './components/ResultsScreen';
import QuestionRenderer from './components/QuestionRenderer';
import WelcomeScreen from './components/WelcomeScreen';

type StepItem =
  | { type: 'welcome' }
  | { type: 'section-intro'; section: HydratedSection; sectionIndex: number }
  | { type: 'question'; question: HydratedFormQuestion; sectionIndex: number; sectionTitle: string }
  | { type: 'results' };

// Question types that auto-advance after selection
const AUTO_ADVANCE_TYPES = new Set([
  'image-choice',
  'likert-boxes',
  'star-rating',
  'multiple-choice',
  'table-choice',
  'multi-option',
]);

export default function AssessmentForm() {
  const [config, setConfig] = useState<HydratedFormConfig | null>(null);
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  // Load form config on mount
  useEffect(() => {
    fetch('/api/assessment/config')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load form');
        return res.json();
      })
      .then((data: HydratedFormConfig) => {
        setConfig(data);

        // Flatten sections into steps
        const flatSteps: StepItem[] = [];
        // Add welcome screen as first step
        flatSteps.push({ type: 'welcome' });
        data.sections.forEach((section, sIdx) => {
          flatSteps.push({ type: 'section-intro', section, sectionIndex: sIdx });
          section.questions.forEach((q) => {
            flatSteps.push({
              type: 'question',
              question: q,
              sectionIndex: sIdx,
              sectionTitle: section.title,
            });
          });
        });
        flatSteps.push({ type: 'results' });
        setSteps(flatSteps);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load assessment. Please try again.');
        setLoading(false);
      });
  }, []);

  // Count total questions for progress
  const totalQuestions = steps.filter((s) => s.type === 'question').length;
  const currentQuestionIndex = steps
    .slice(0, currentStep + 1)
    .filter((s) => s.type === 'question').length;

  const currentStepItem = steps[currentStep];

  const transition = useCallback((nextStep: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setTransitioning(false);
    }, 200);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setIsComplete(true);
      // Move to results step
      const resultsIdx = steps.findIndex((s) => s.type === 'results');
      if (resultsIdx >= 0) transition(resultsIdx);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, userInfo, isSubmitting, steps, transition]);

  const goNext = useCallback(() => {
    const nextStep = currentStep + 1;
    if (nextStep >= steps.length) return;

    // Check if we're on the last question (before results)
    const nextItem = steps[nextStep];
    if (nextItem?.type === 'results' && !isComplete) {
      handleSubmit();
      return;
    }

    transition(nextStep);
  }, [currentStep, steps, isComplete, handleSubmit, transition]);

  const goBack = useCallback(() => {
    if (currentStep <= 0) return;
    transition(currentStep - 1);
  }, [currentStep, transition]);

  const handleAnswer = useCallback(
    (value: string | number | string[]) => {
      if (!currentStepItem || currentStepItem.type !== 'question') return;

      const ref = currentStepItem.question.questionRef;

      // Handle special refs for user info
      if (ref === 'user_name' && typeof value === 'string') {
        const [first, last] = value.split('|');
        setUserInfo((prev) => ({ ...prev, firstName: first || '', lastName: last || '' }));
      } else if (ref === 'user_email' && typeof value === 'string') {
        setUserInfo((prev) => ({ ...prev, email: value }));
      }

      setAnswers((prev) => ({ ...prev, [ref]: value }));

      // Auto-advance for certain question types
      if (AUTO_ADVANCE_TYPES.has(currentStepItem.question.displayType)) {
        setTimeout(() => goNext(), 400);
      }
    },
    [currentStepItem, goNext]
  );

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentStepItem?.type === 'welcome') {
          goNext();
        } else if (currentStepItem?.type === 'section-intro') {
          goNext();
        } else if (currentStepItem?.type === 'question') {
          const ref = currentStepItem.question.questionRef;
          const hasAnswer = answers[ref] !== undefined;
          if (hasAnswer && !AUTO_ADVANCE_TYPES.has(currentStepItem.question.displayType)) {
            goNext();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepItem, answers, goNext]);

  // Determine if Next button should show/be enabled
  const getNavState = () => {
    if (!currentStepItem || currentStepItem.type !== 'question') {
      return { showNext: false, nextEnabled: false, showBack: currentStep > 0 };
    }

    const q = currentStepItem.question;
    const ref = q.questionRef;
    const hasAnswer = answers[ref] !== undefined;
    const isAutoAdvance = AUTO_ADVANCE_TYPES.has(q.displayType);

    // Manual advance types always show Next
    const showNext = !isAutoAdvance;

    // Validation for specific types
    let nextEnabled = hasAnswer;
    if (ref === 'user_name') {
      nextEnabled = userInfo.firstName.length > 0 && userInfo.lastName.length > 0;
    } else if (ref === 'user_email') {
      nextEnabled = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email);
    } else if (q.displayType === 'matrix') {
      // Matrix requires all rows to be filled
      const rows = q.matrixRows || Object.keys(q.options || {});
      if (hasAnswer && typeof answers[ref] === 'string') {
        try {
          const selections = JSON.parse(answers[ref] as string);
          nextEnabled = rows.every((row) => selections[row] !== undefined);
        } catch {
          nextEnabled = false;
        }
      } else {
        nextEnabled = false;
      }
    } else if (q.displayType === 'rank-order') {
      // Rank-order is always valid (default order counts as an answer)
      nextEnabled = true;
    }

    return { showNext, nextEnabled, showBack: currentStep > 0 };
  };

  // Get sub-question label (e.g., "6a", "6b")
  const getSubQuestionLabel = () => {
    if (!currentStepItem || currentStepItem.type !== 'question') return null;

    const sectionIdx = currentStepItem.sectionIndex;
    const section = config?.sections[sectionIdx];
    if (!section) return null;

    const questionIdx = section.questions.findIndex(
      q => q.questionRef === currentStepItem.question.questionRef
    );
    if (questionIdx === -1) return null;

    const letter = String.fromCharCode(97 + questionIdx); // a, b, c, etc.
    return `${sectionIdx + 1}${letter}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading assessment...</div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-white underline hover:text-purple-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!config || !currentStepItem) return null;

  const bgStyle = config.backgroundImage
    ? { backgroundImage: `url(${config.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  const sectionIndex =
    currentStepItem.type === 'section-intro'
      ? currentStepItem.sectionIndex
      : currentStepItem.type === 'question'
        ? currentStepItem.sectionIndex
        : 0;
  const sectionTitle =
    currentStepItem.type === 'section-intro'
      ? currentStepItem.section.title
      : currentStepItem.type === 'question'
        ? currentStepItem.sectionTitle
        : '';

  const navState = getNavState();

  return (
    <div className="min-h-screen relative" style={bgStyle}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {currentStepItem.type !== 'welcome' && (
          <ProgressBar currentIndex={currentQuestionIndex} total={totalQuestions} />
        )}

        {currentStepItem.type === 'question' && (
          <TopBar sectionNumber={sectionIndex + 1} sectionTitle={sectionTitle} />
        )}

        {/* Error banner */}
        {error && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-6 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Main content area */}
        <div
          className={`flex-1 flex items-center justify-center px-4 py-20 transition-opacity duration-200 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="w-full max-w-5xl">
            {currentStepItem.type === 'welcome' && (
              <WelcomeScreen onStart={goNext} />
            )}

            {currentStepItem.type === 'section-intro' && (
              <SectionIntro
                section={currentStepItem.section}
                sectionNumber={currentStepItem.sectionIndex + 1}
                onStart={goNext}
              />
            )}

            {currentStepItem.type === 'question' && (
              <div className="flex flex-col items-center">
                {/* Question text with inline sub-question label */}
                <h2 className="text-white text-xl md:text-2xl font-bold mb-2 leading-relaxed whitespace-pre-line text-center max-w-3xl">
                  {getSubQuestionLabel() && (
                    <span className="text-white/50 text-sm align-top mr-2">{getSubQuestionLabel()} →</span>
                  )}
                  {currentStepItem.question.text}
                </h2>
                {currentStepItem.question.description && (
                  <p className="text-white/60 text-sm mb-8 italic whitespace-pre-line text-center max-w-2xl">
                    {currentStepItem.question.description}
                  </p>
                )}
                {!currentStepItem.question.description && <div className="mb-8" />}

                {/* Question component */}
                <div className="w-full">
                  <QuestionRenderer
                    question={currentStepItem.question}
                    currentAnswer={answers[currentStepItem.question.questionRef]}
                    onAnswer={handleAnswer}
                  />
                </div>
              </div>
            )}

            {currentStepItem.type === 'results' && (
              <ResultsScreen config={config.resultsPage} email={userInfo.email} />
            )}
          </div>
        </div>

        {/* Navigation */}
        {currentStepItem.type === 'question' && (
          <NavigationButtons
            onBack={goBack}
            onNext={goNext}
            showBack={navState.showBack}
            showNext={navState.showNext}
            nextEnabled={navState.nextEnabled}
            nextLabel={isSubmitting ? 'Submitting...' : 'Next'}
          />
        )}

        {currentStepItem.type === 'section-intro' && currentStep > 0 && (
          <div className="fixed bottom-8 left-6 z-40">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
