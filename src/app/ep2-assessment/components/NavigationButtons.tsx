'use client';

interface NavigationButtonsProps {
  onBack: () => void;
  onNext: () => void;
  showBack: boolean;
  showNext: boolean;
  nextEnabled: boolean;
  nextLabel?: string;
}

export default function NavigationButtons({
  onBack,
  onNext,
  showBack,
  showNext,
  nextEnabled,
  nextLabel = 'Next',
}: NavigationButtonsProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {showBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}

        {showNext && (
          <div className="flex items-center gap-3">
            <button
              onClick={onNext}
              disabled={!nextEnabled}
              className={`
                px-8 py-3 rounded-full font-medium text-sm transition-all duration-200
                ${nextEnabled
                  ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
                }
              `}
            >
              {nextLabel}
            </button>
            <span className="text-white/40 text-xs hidden sm:inline">
              press <strong>Enter &crarr;</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
