'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState, useEffect } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function EmailInput({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const [email, setEmail] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState<boolean>(false);

  useEffect(() => {
    if (typeof currentAnswer === 'string') {
      setEmail(currentAnswer);
    }
  }, [currentAnswer]);

  const validateEmail = (value: string): boolean => {
    if (!value) return true; // Empty is valid until we check required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsTouched(true);

    const valid = validateEmail(value);
    setIsValid(valid);

    onAnswer(value);
  };

  const showError = isTouched && !isValid;

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      {question.description && (
        <p className="text-white/80 text-center">{question.description}</p>
      )}

      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="name@example.com"
          className={`w-full bg-transparent border-b-2 ${
            showError ? 'border-red-400' : 'border-white/30'
          } focus:border-purple-400 outline-none text-white text-2xl py-3 px-1 transition-colors placeholder:text-white/30`}
          autoComplete="email"
        />

        {showError && (
          <div className="absolute left-0 top-full mt-2 flex items-center gap-2 text-red-400 text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Please enter a valid email address</span>
          </div>
        )}

        {email && isValid && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {question.required && (
        <p className="text-white/50 text-xs text-center">* Required</p>
      )}
    </div>
  );
}
