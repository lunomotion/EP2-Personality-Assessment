'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState, useEffect } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function NameInput({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  useEffect(() => {
    if (typeof currentAnswer === 'string' && currentAnswer.includes('|')) {
      const [first, last] = currentAnswer.split('|');
      setFirstName(first || '');
      setLastName(last || '');
    }
  }, [currentAnswer]);

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    onAnswer(`${value}|${lastName}`);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    onAnswer(`${firstName}|${value}`);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto">
      {question.description && (
        <p className="text-white/80 text-center">{question.description}</p>
      )}

      <div className="flex flex-col gap-6">
        {/* First name input */}
        <div className="relative">
          <label className="block text-white/60 text-sm mb-2">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={handleFirstNameChange}
            placeholder="John"
            className="w-full bg-transparent border-b-2 border-white/30 focus:border-purple-400 outline-none text-white text-2xl py-3 px-1 transition-colors placeholder:text-white/30"
            autoComplete="given-name"
          />
        </div>

        {/* Last name input */}
        <div className="relative">
          <label className="block text-white/60 text-sm mb-2">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={handleLastNameChange}
            placeholder="Doe"
            className="w-full bg-transparent border-b-2 border-white/30 focus:border-purple-400 outline-none text-white text-2xl py-3 px-1 transition-colors placeholder:text-white/30"
            autoComplete="family-name"
          />
        </div>
      </div>

      {question.required && (
        <p className="text-white/50 text-xs text-center">* Both fields required</p>
      )}
    </div>
  );
}
