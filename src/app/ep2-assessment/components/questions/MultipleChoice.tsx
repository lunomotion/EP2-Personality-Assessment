'use client';

import Image from 'next/image';
import { HydratedFormQuestion } from '@/types/form-config';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function MultipleChoice({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = question.optionLabels || question.options || {};
  const optionKeys = Object.keys(options);
  const hasImages = question.optionImages && Object.keys(question.optionImages).length > 0;

  // Determine grid columns based on number of options
  let gridCols: string;
  if (optionKeys.length === 2) {
    gridCols = 'grid-cols-2';
  } else if (optionKeys.length === 3) {
    gridCols = 'grid-cols-2 sm:grid-cols-3';
  } else if (optionKeys.length === 4) {
    gridCols = 'grid-cols-2 md:grid-cols-4';
  } else if (optionKeys.length <= 6) {
    gridCols = 'grid-cols-2 sm:grid-cols-3'; // 5-6 options: 3 columns max, wraps to 2 rows
  } else {
    gridCols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'; // 7+ options: 4 columns on large, wraps
  }

  return (
    <div className={`grid ${gridCols} gap-3 w-full max-w-5xl mx-auto`}>
      {optionKeys.map((key, index) => {
        const isSelected = currentAnswer === key;
        const letter = String.fromCharCode(65 + index); // A, B, C, etc.
        const imageUrl = question.optionImages?.[key];

        return (
          <button
            key={key}
            onClick={() => onAnswer(key)}
            className={`relative flex flex-col items-center gap-3 p-3 rounded-xl border-2 transition-all overflow-hidden ${
              isSelected
                ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {/* Circular image at top */}
            {hasImages && imageUrl && (
              <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${
                isSelected ? 'border-purple-400' : 'border-white/20'
              }`}>
                <Image
                  src={imageUrl}
                  alt={`Option ${letter}`}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Letter badge */}
            <div
              className={`w-9 h-9 rounded-md flex items-center justify-center font-bold ${
                isSelected
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {letter}
            </div>

            {/* Option text */}
            <p className="text-white text-sm font-medium text-center break-words leading-relaxed px-1">
              {options[key]}
            </p>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
