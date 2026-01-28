'use client';

import { HydratedFormQuestion } from '@/types/form-config';
import { useState, useEffect } from 'react';

interface QuestionComponentProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function RankOrder({ question, currentAnswer, onAnswer }: QuestionComponentProps) {
  const options = question.options || {};
  const optionKeys = Object.keys(options);

  // Initialize ordered items from currentAnswer or default to original order
  const [orderedItems, setOrderedItems] = useState<string[]>(() => {
    if (Array.isArray(currentAnswer)) {
      return currentAnswer;
    }
    return optionKeys;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(currentAnswer) && currentAnswer.length > 0) {
      setOrderedItems(currentAnswer);
    } else if (optionKeys.length > 0) {
      setOrderedItems(optionKeys);
    }
  }, [currentAnswer]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...orderedItems];
    const draggedItem = newItems[draggedIndex];

    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setOrderedItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    onAnswer(orderedItems);
  };

  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-pink-500',
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-2xl mx-auto">
      {question.description && (
        <p className="text-white/80 text-center mb-2">{question.description}</p>
      )}

      <p className="text-white/60 text-sm text-center mb-4">
        Drag to reorder from most important (1) to least important
      </p>

      {orderedItems.map((key, index) => (
        <div
          key={key}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-4 p-4 rounded-lg bg-white/5 border-2 border-white/10 cursor-move transition-all hover:bg-white/10 ${
            draggedIndex === index ? 'opacity-50 scale-95' : ''
          }`}
        >
          {/* Drag handle */}
          <div
            className={`flex-shrink-0 w-12 h-12 ${
              colors[index % colors.length]
            } rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
            </svg>
          </div>

          {/* Rank number */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{index + 1}</span>
          </div>

          {/* Label text */}
          <span className="text-white font-medium flex-1">{options[key]}</span>
        </div>
      ))}
    </div>
  );
}
