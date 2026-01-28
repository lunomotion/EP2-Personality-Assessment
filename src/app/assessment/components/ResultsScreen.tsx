'use client';

import type { FormResultsConfig } from '@/types/form-config';

interface ResultsScreenProps {
  config: FormResultsConfig;
  email: string;
}

export default function ResultsScreen({ config, email }: ResultsScreenProps) {
  const reportUrl = config.buttonUrlTemplate.replace('{email}', encodeURIComponent(email));

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 max-w-xl mx-auto">
      <div
        className="text-white text-2xl md:text-3xl font-bold mb-6"
        dangerouslySetInnerHTML={{ __html: config.headingHtml }}
      />
      <div
        className="text-white/70 text-lg mb-10"
        dangerouslySetInnerHTML={{ __html: config.bodyHtml }}
      />
      <a
        href={reportUrl}
        className="bg-gray-900 text-white px-10 py-4 rounded-full font-medium text-base hover:bg-gray-800 transition-colors shadow-lg border border-white/10"
      >
        {config.buttonText}
      </a>
    </div>
  );
}
