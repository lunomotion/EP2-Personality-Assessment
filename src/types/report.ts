// EP2 Assessment Report Types
// Based on data structure from ep2_code_node.js

export type AnimalType = 'African Dog' | 'Lion' | 'Killer Whale' | 'Tiger';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type RewardLevel = 'Low' | 'Medium' | 'High';
export type DriverType = 'Boss' | 'Control' | 'Passion' | 'Money' | 'Solve' | 'Impact' | 'Legacy';
export type AOIType = 'Arts' | 'Consulting' | 'Digital' | 'Education' | 'Hospitality' | 'Health' | 'Personal' | 'Retail' | 'Social' | 'Tech' | 'Trades';
export type StrategyType = 'Creator' | 'Consolidator' | 'Franchisee' | 'Contractor';

export interface ReportData {
  // User info
  name: string;
  email: string;
  reportDate: string;

  // Animal personality
  animalType: AnimalType;
  personalityTitle: string;
  personalityText: string;
  traits: string[];

  // Risk assessment
  riskLevel: RiskLevel;
  riskScore: number;
  riskCategory: string;
  riskText: string;

  // Reward assessment
  rewardLevel: RewardLevel;
  rewardScore: number;
  rewardCategory: string;
  rewardText: string;

  // Entrepreneurial driver
  driverKey: DriverType;
  driverTitle: string;
  driverDescription: string;
  driverQuestions: string[];

  // Areas of Interest
  aoi1Key: AOIType;
  aoi1Title: string;
  aoi1Description: string;
  aoi1Businesses: string[];

  aoi2Key: AOIType;
  aoi2Title: string;
  aoi2Description: string;
  aoi2Businesses: string[];

  // Business Strategy
  strategyKey: StrategyType;
  strategyTitle: string;
  strategyDescription: string;
  strategyActions: string[];
}

// Icon path mappings (served via /api/uploads/ which checks custom uploads then falls back to public/icons/)
export const ANIMAL_ICONS: Record<AnimalType, { icon: string; withWords: string }> = {
  'African Dog': {
    icon: '/api/uploads/animals/african_dog_nowords.png',
    withWords: '/api/uploads/animals/african_dogs.png'
  },
  Lion: {
    icon: '/api/uploads/animals/Lion_nowords.png',
    withWords: '/api/uploads/animals/Lion.png'
  },
  'Killer Whale': {
    icon: '/api/uploads/animals/Whale_nowords.png',
    withWords: '/api/uploads/animals/killer_whale.png'
  },
  Tiger: {
    icon: '/api/uploads/animals/Tiger_nowords.png',
    withWords: '/api/uploads/animals/Tiger.png'
  },
};

export const RISK_ICONS: Record<RiskLevel, string> = {
  Low: '/api/uploads/risk-reward/Low Risk.png',
  Medium: '/api/uploads/risk-reward/Medium Risk.png',
  High: '/api/uploads/risk-reward/High Risk.png',
};

export const REWARD_ICONS: Record<RewardLevel, string> = {
  Low: '/api/uploads/risk-reward/Low Reward.png',
  Medium: '/api/uploads/risk-reward/Medium Reward.png',
  High: '/api/uploads/risk-reward/High Reward.png',
};

export const DRIVER_ICONS: Record<DriverType, string> = {
  Boss: '/api/uploads/drivers/Boss.png',
  Control: '/api/uploads/drivers/Control.png',
  Passion: '/api/uploads/drivers/Passion.png',
  Money: '/api/uploads/drivers/Money.png',
  Solve: '/api/uploads/drivers/Solve.png',
  Impact: '/api/uploads/drivers/Impact.png',
  Legacy: '/api/uploads/drivers/Legacy.png',
};

export const AOI_ICONS: Record<AOIType, string> = {
  Arts: '/api/uploads/aoi/Arts.png',
  Consulting: '/api/uploads/aoi/Consult.png',
  Digital: '/api/uploads/aoi/Digital.png',
  Education: '/api/uploads/aoi/Educate.png',
  Hospitality: '/api/uploads/aoi/Hospitality.png',
  Health: '/api/uploads/aoi/Health.png',
  Personal: '/api/uploads/aoi/Personal.png',
  Retail: '/api/uploads/aoi/Retail.png',
  Social: '/api/uploads/aoi/Social.png',
  Tech: '/api/uploads/aoi/Tech.png',
  Trades: '/api/uploads/aoi/Tech.png', // Fallback
};

export const STRATEGY_ICONS: Record<StrategyType, string> = {
  Creator: '/api/uploads/strategies/Creator.png',
  Consolidator: '/api/uploads/strategies/Consolidator.png',
  Franchisee: '/api/uploads/strategies/Franchise.png',
  Contractor: '/api/uploads/strategies/Contract.png',
};
