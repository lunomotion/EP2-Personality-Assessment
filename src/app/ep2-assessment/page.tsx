import { Suspense } from 'react';
import AssessmentForm from './AssessmentForm';

export const metadata = {
  title: 'EP2 Assessment — Praxia Insights',
  description: 'Take the Entrepreneurial Personality assessment to discover your unique profile.',
};

function AssessmentLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-lg animate-pulse">Loading assessment...</div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<AssessmentLoading />}>
      <AssessmentForm />
    </Suspense>
  );
}
