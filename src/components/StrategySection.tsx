import { STRATEGY_ICONS, type StrategyType } from '@/types/report';
import { IconCard } from './IconCard';

interface StrategySectionProps {
  strategyKey: StrategyType;
  strategyTitle: string;
  strategyDescription: string;
  strategyActions: string[];
}

export function StrategySection({ strategyKey, strategyTitle, strategyDescription, strategyActions }: StrategySectionProps) {
  return (
    <section className="mb-6">
      <div className="report-section">
        <IconCard src={STRATEGY_ICONS[strategyKey]} alt={strategyTitle} size="lg" borderColor="black" />
        <div className="flex-1">
          <h3 className="report-section-title">
            {strategyTitle}
          </h3>
          <p className="report-section-text mb-3">
            {strategyDescription}
          </p>
          <ul className="space-y-1">
            {strategyActions.map((action, index) => (
              <li key={index} className="flex gap-2 text-gray-700 text-sm">
                <span className="text-ep-purple font-bold flex-shrink-0">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
