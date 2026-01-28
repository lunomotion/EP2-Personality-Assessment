import { Suspense } from 'react';
import { ReportContent } from './ReportContent';
import { LoadingSpinner } from '@/components';

export const metadata = {
  title: 'Your EP2 Assessment Report | Praxia Insights',
  description: 'View your personalized Entrepreneurial Pursuit Assessment results',
};

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReportContent />
    </Suspense>
  );
}
