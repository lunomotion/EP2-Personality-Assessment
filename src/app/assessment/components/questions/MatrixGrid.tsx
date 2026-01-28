'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState, useEffect } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function MatrixGrid({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  // Parse current answer from JSON string
  const parseAnswer = (answer: string | number | string[] | undefined): Record<string, string> => {
    if (typeof answer === 'string' && answer.trim()) {
      try {
        return JSON.parse(answer);
      } catch {
        return {};
      }
    }
    return {};
  };

  const [selections, setSelections] = useState<Record<string, string>>(
    parseAnswer(currentAnswer)
  );

  const rows = question.matrixRows || Object.keys(question.options || {});
  const columns = question.matrixColumns || ['1', '2', '3', '4', '5'];

  useEffect(() => {
    setSelections(parseAnswer(currentAnswer));
  }, [currentAnswer]);

  const handleSelect = (row: string, column: string) => {
    const newSelections = { ...selections, [row]: column };
    setSelections(newSelections);
    onAnswer(JSON.stringify(newSelections));
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-auto">
      <div className="inline-block min-w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left"></th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-3 text-center text-white/70 font-semibold text-xs md:text-sm min-w-[100px] max-w-[140px]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row}
                className={`border-t border-white/10 ${
                  rowIndex % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                }`}
              >
                <td className="p-3 text-white font-medium text-sm">
                  {question.options?.[row] || row}
                </td>
                {columns.map((col) => {
                  const isSelected = selections[row] === col;

                  return (
                    <td key={col} className="p-3 text-center">
                      <button
                        onClick={() => handleSelect(row, col)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          isSelected
                            ? 'bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50'
                            : 'bg-white/5 border-white/30 hover:bg-white/10 hover:border-white/50'
                        }`}
                        aria-label={`Select ${col} for ${row}`}
                      >
                        {isSelected && (
                          <div className="w-full h-full rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {question.description && (
        <p className="text-white/60 text-sm mt-4 text-center">
          {question.description}
        </p>
      )}
    </div>
  );
}
