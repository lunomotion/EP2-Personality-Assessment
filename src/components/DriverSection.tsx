import { DRIVER_ICONS, type DriverType } from '@/types/report';
import { IconCard } from './IconCard';

interface DriverSectionProps {
  driverKey: DriverType;
  driverTitle: string;
  driverDescription: string;
  driverQuestions: string[];
}

export function DriverSection({ driverKey, driverTitle, driverDescription, driverQuestions }: DriverSectionProps) {
  return (
    <section className="mb-6">
      <div className="report-section">
        <IconCard src={DRIVER_ICONS[driverKey]} alt={driverTitle} size="lg" borderColor="black" />
        <div className="flex-1">
          <h3 className="report-section-title">
            {driverTitle}
          </h3>
          <p className="report-section-text mb-3">
            {driverDescription}
          </p>
          <p className="text-gray-600 text-sm mb-2">
            You might reflect on the following questions to help you choose the right type of business:
          </p>
          <ul className="space-y-1">
            {driverQuestions.map((question, index) => (
              <li key={index} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-ep-purple font-bold flex-shrink-0">•</span>
                <span>{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
