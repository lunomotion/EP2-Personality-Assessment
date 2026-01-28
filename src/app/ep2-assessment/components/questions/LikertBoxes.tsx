'use client';

import { HydratedFormQuestion } from '@/types/form-config';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function LikertBoxes({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col items-center gap-6">
      {question.description && (
        <p className="text-white/80 text-center max-w-2xl">{question.description}</p>
      )}

      <div className="flex gap-3">
        {options.map((num) => {
          const isSelected = currentAnswer === String(num);

          return (
            <button
              key={num}
              onClick={() => onAnswer(String(num))}
              className={`w-20 h-20 rounded-lg border-2 transition-all font-bold text-xl ${
                isSelected
                  ? 'bg-purple-500 border-purple-400 text-white scale-105 shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:border-white/40'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between w-full max-w-md text-sm text-white/60">
        <span>Strongly Disagree</span>
        <span>Strongly Agree</span>
      </div>
    </div>
  );
}
