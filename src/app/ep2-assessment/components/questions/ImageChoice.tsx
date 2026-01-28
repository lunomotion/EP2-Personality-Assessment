'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import Image from 'next/image';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function ImageChoice({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = question.optionLabels || question.options || {};
  const optionKeys = Object.keys(options);

  // Determine grid columns based on number of options
  let gridCols: string;
  if (optionKeys.length === 2) {
    gridCols = 'grid-cols-2';
  } else if (optionKeys.length === 3) {
    gridCols = 'grid-cols-2 sm:grid-cols-3';
  } else if (optionKeys.length === 4) {
    gridCols = 'grid-cols-2 md:grid-cols-4';
  } else if (optionKeys.length <= 6) {
    gridCols = 'grid-cols-2 sm:grid-cols-3';
  } else {
    gridCols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'; // 7+ options: max 4 columns
  }

  return (
    <div className={`grid ${gridCols} gap-4 w-full max-w-5xl mx-auto`}>
      {optionKeys.map((key, index) => {
        const isSelected = currentAnswer === key;
        const letter = String.fromCharCode(65 + index); // A, B, C, etc.
        const imageUrl = question.optionImages?.[key];

        return (
          <button
            key={key}
            onClick={() => onAnswer(key)}
            className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border-2 transition-all hover:bg-white/10 ${
              isSelected
                ? 'ring-2 ring-purple-400 border-purple-400 bg-white/15'
                : 'border-white/10'
            }`}
          >
            <div className="relative w-24 h-24 md:w-28 md:h-28">
              {/* Letter badge */}
              <div className="absolute -top-2 -left-2 z-10 w-7 h-7 md:w-8 md:h-8 bg-purple-500 rounded flex items-center justify-center text-white font-bold text-xs md:text-sm">
                {letter}
              </div>

              {/* Image or placeholder */}
              {imageUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/20">
                  <Image
                    src={imageUrl}
                    alt={options[key]}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-white/20 flex items-center justify-center">
                  <span className="text-3xl md:text-4xl font-bold text-white/70">{letter}</span>
                </div>
              )}
            </div>

            {/* Label text */}
            <span className="text-white font-medium text-center text-xs md:text-sm leading-snug">
              {options[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
