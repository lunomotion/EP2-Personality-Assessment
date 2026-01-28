'use client';

import { HydratedFormQuestion } from '@/types/form-config';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function MultiOption({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = question.options || {};
  const optionKeys = Object.keys(options);

  const handleSelect = (key: string) => {
    onAnswer(key);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
      {question.description && (
        <p className="text-white/80 text-center mb-4">{question.description}</p>
      )}

      {optionKeys.map((key, index) => {
        const isSelected = currentAnswer === key;
        const letter = String.fromCharCode(65 + index); // A, B, C, D

        return (
          <button
            key={key}
            onClick={() => handleSelect(key)}
            className={`flex items-center gap-4 p-5 rounded-lg border-2 transition-all text-left group ${
              isSelected
                ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
            }`}
          >
            {/* Letter badge */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70 group-hover:bg-white/20'
              }`}
            >
              {letter}
            </div>

            {/* Option text */}
            <span className="text-white font-medium text-lg flex-1">{options[key]}</span>

            {/* Arrow indicator on hover */}
            <div
              className={`flex-shrink-0 transition-all ${
                isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        );
      })}
    </div>
  );
}
