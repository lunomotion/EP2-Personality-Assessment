'use client';

import type { HydratedSection } from '@/types/form-config';

interface SectionIntroProps {
  section: HydratedSection;
  sectionNumber: number;
  onStart: () => void;
}

export default function SectionIntro({ section, sectionNumber, onStart }: SectionIntroProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 max-w-2xl mx-auto">
      {/* Section number, arrow, and title - all on one line */}
      <h1 className="text-white text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
        <span className="text-white/70 text-sm align-top mr-2">{sectionNumber} →</span>
        {section.title}
      </h1>

      {/* Subtitle/description */}
      {section.subtitle && (
        <p className="text-white/60 text-base md:text-lg italic mb-10">
          {section.subtitle}
        </p>
      )}
      {!section.subtitle && <div className="mb-10" />}

      {/* Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onStart}
          className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-800 transition-colors shadow-lg border border-white/10"
        >
          {section.introButtonText}
        </button>
        <span className="text-white/40 text-xs hidden sm:inline">
          press <strong>Enter ↵</strong>
        </span>
      </div>
    </div>
  );
}
