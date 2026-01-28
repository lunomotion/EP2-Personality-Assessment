'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function StarRating({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Determine number of stars from question options
  const optionKeys = question.options ? Object.keys(question.options) : [];
  const maxStars = optionKeys.length > 0 ? Math.max(...optionKeys.map(k => parseInt(k) || 5)) : 5;
  const starCount = maxStars === 7 ? 7 : 5;

  const stars = Array.from({ length: starCount }, (_, i) => i + 1);
  const currentRating = typeof currentAnswer === 'string' ? parseInt(currentAnswer) : 0;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {stars.map((num) => {
          const isFilled = (hoveredStar !== null ? num <= hoveredStar : num <= currentRating);

          return (
            <button
              key={num}
              onClick={() => onAnswer(String(num))}
              onMouseEnter={() => setHoveredStar(num)}
              onMouseLeave={() => setHoveredStar(null)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill={isFilled ? '#a855f7' : 'none'}
                stroke={isFilled ? '#a855f7' : '#ffffff40'}
                strokeWidth="1.5"
                className="transition-all"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>

      <div className="flex gap-6">
        {stars.map((num) => (
          <span
            key={num}
            className={`text-sm font-medium transition-colors ${
              num === currentRating
                ? 'text-purple-400'
                : 'text-white/50'
            }`}
          >
            {num}
          </span>
        ))}
      </div>

      {question.description && (
        <p className="text-white/60 text-sm text-center max-w-md mt-2">
          {question.description}
        </p>
      )}
    </div>
  );
}
