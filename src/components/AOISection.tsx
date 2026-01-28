import { AOI_ICONS, type AOIType } from '@/types/report';
import { IconCard } from './IconCard';

interface AOISectionProps {
  aoiKey: AOIType;
  aoiTitle: string;
  aoiDescription: string;
  aoiBusinesses: string[];
}

export function AOISection({ aoiKey, aoiTitle, aoiDescription, aoiBusinesses }: AOISectionProps) {
  return (
    <section className="mb-6">
      <div className="report-section">
        <IconCard src={AOI_ICONS[aoiKey]} alt={aoiTitle} size="lg" borderColor="black" />
        <div className="flex-1">
          <h3 className="report-section-title">
            {aoiTitle}
          </h3>
          <p className="report-section-text mb-3">
            {aoiDescription}
          </p>
          <p className="text-gray-600 text-sm mb-2">
            You might enjoy the following types of businesses:
          </p>
          <ul className="space-y-1">
            {aoiBusinesses.map((business, index) => (
              <li key={index} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-ep-purple font-bold flex-shrink-0">•</span>
                <span>{business}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
