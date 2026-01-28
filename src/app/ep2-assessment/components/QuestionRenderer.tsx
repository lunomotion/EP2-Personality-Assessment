'use client';

import type { HydratedFormQuestion } from '@/types/form-config';
import ImageChoice from './questions/ImageChoice';
import LikertBoxes from './questions/LikertBoxes';
import StarRating from './questions/StarRating';
import MultipleChoice from './questions/MultipleChoice';
import TableChoice from './questions/TableChoice';
import MatrixGrid from './questions/MatrixGrid';
import RankOrder from './questions/RankOrder';
import EmailInput from './questions/EmailInput';
import NameInput from './questions/NameInput';
import FreeText from './questions/FreeText';
import MultiOption from './questions/MultiOption';

interface QuestionRendererProps {
  question: HydratedFormQuestion;
  currentAnswer: string | number | string[] | undefined;
  onAnswer: (value: string | number | string[]) => void;
}

export default function QuestionRenderer({
  question,
  currentAnswer,
  onAnswer,
}: QuestionRendererProps) {
  switch (question.displayType) {
    case 'image-choice':
      return <ImageChoice question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'likert-boxes':
      return <LikertBoxes question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'star-rating':
      return <StarRating question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'multiple-choice':
      return <MultipleChoice question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'table-choice':
      return <TableChoice question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'matrix':
      return <MatrixGrid question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'rank-order':
      return <RankOrder question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'email-input':
      return <EmailInput question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'name-input':
      return <NameInput question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'free-text':
      return <FreeText question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    case 'multi-option':
      return <MultiOption question={question} currentAnswer={currentAnswer} onAnswer={onAnswer} />;
    default:
      return (
        <div className="text-white/60 text-center py-8">
          Unsupported question type: {question.displayType}
        </div>
      );
  }
}
