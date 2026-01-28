'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState, useEffect } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function FreeText({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const [text, setText] = useState<string>(typeof currentAnswer === 'string' ? currentAnswer : '');

  useEffect(() => {
    setText(typeof currentAnswer === 'string' ? currentAnswer : '');
  }, [currentAnswer, question.questionRef]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    onAnswer(value);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {question.description && (
        <p className="text-white/80 text-center">{question.description}</p>
      )}

      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full bg-white/5 border-2 border-white/10 focus:border-purple-400 rounded-lg outline-none text-white text-lg p-4 transition-colors placeholder:text-white/30 resize-none"
        />

        {/* Character count (optional) */}
        {text.length > 0 && (
          <div className="absolute bottom-3 right-3 text-white/40 text-xs">
            {text.length} characters
          </div>
        )}
      </div>

      {question.required && (
        <p className="text-white/50 text-xs text-center">* Required</p>
      )}
    </div>
  );
}
