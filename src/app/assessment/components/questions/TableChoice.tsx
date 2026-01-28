'use client';

import { HydratedFormQuestion } from '@/types/form-config';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function TableChoice({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = question.optionLabels || question.options || {};
  const optionKeys = Object.keys(options);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Description text */}
      {question.description && (
        <div className="text-white/90 whitespace-pre-line leading-relaxed">
          {question.description}
        </div>
      )}

      {/* Hunting data table */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Animal</th>
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Hunting Group Size</th>
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Success Rate</th>
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Risk</th>
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Reward</th>
              <th className="px-4 py-3 text-left text-white/70 font-semibold">Time to Materialize</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-white font-medium">Tiger</td>
              <td className="px-4 py-3 text-white/80">Solo</td>
              <td className="px-4 py-3 text-white/80">8%</td>
              <td className="px-4 py-3 text-red-400 font-medium">Very High</td>
              <td className="px-4 py-3 text-green-400 font-medium">100% Keep</td>
              <td className="px-4 py-3 text-white/80">1-2 Years</td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-white font-medium">Lion</td>
              <td className="px-4 py-3 text-white/80">2-3</td>
              <td className="px-4 py-3 text-white/80">25%</td>
              <td className="px-4 py-3 text-orange-400 font-medium">High</td>
              <td className="px-4 py-3 text-yellow-400 font-medium">70% Share</td>
              <td className="px-4 py-3 text-white/80">6-12 Months</td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-white font-medium">African Wild Dog</td>
              <td className="px-4 py-3 text-white/80">10-20</td>
              <td className="px-4 py-3 text-white/80">85%</td>
              <td className="px-4 py-3 text-green-400 font-medium">Low</td>
              <td className="px-4 py-3 text-white/60 font-medium">15% Share</td>
              <td className="px-4 py-3 text-white/80">3-6 Months</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-3 text-white font-medium">Killer Whale</td>
              <td className="px-4 py-3 text-white/80">5-30</td>
              <td className="px-4 py-3 text-white/80">90%</td>
              <td className="px-4 py-3 text-yellow-400 font-medium">Medium</td>
              <td className="px-4 py-3 text-yellow-400 font-medium">50% Share</td>
              <td className="px-4 py-3 text-white/80">6-18 Months</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Option buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {optionKeys.map((key, index) => {
          const isSelected = currentAnswer === key;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${
                  isSelected
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {letter}
              </div>
              <span className="text-white font-medium text-sm">{options[key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
