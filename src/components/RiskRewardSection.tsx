import { RISK_ICONS, REWARD_ICONS, type RiskLevel, type RewardLevel } from '@/types/report';
import { IconCard } from './IconCard';

interface RiskRewardSectionProps {
  riskLevel: RiskLevel;
  riskText: string;
  rewardLevel: RewardLevel;
  rewardText: string;
}

export function RiskRewardSection({ riskLevel, riskText, rewardLevel, rewardText }: RiskRewardSectionProps) {
  return (
    <section className="space-y-4 mb-6">
      {/* Risk Section */}
      <div className="report-section">
        <IconCard src={RISK_ICONS[riskLevel]} alt={`${riskLevel} Risk`} size="lg" borderColor="black" />
        <div className="flex-1">
          <h3 className="report-section-title">
            {riskLevel} Risk
          </h3>
          <p className="report-section-text">
            {riskText}
          </p>
        </div>
      </div>

      {/* Reward Section */}
      <div className="report-section">
        <IconCard src={REWARD_ICONS[rewardLevel]} alt={`${rewardLevel} Reward`} size="lg" borderColor="black" />
        <div className="flex-1">
          <h3 className="report-section-title">
            {rewardLevel} Reward
          </h3>
          <p className="report-section-text">
            {rewardText}
          </p>
        </div>
      </div>
    </section>
  );
}
