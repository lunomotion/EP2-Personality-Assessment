// Scoring engine types

export type QuestionType = 'binary' | 'likert';
export type AnimalKey = 'African Dog' | 'Lion' | 'Killer Whale' | 'Tiger';

export interface RiskRewardQuestion {
  /** Position in survey (1-based) */
  order: number;
  /** Question reference ID (matches Typeform field ref) */
  ref: string;
  /** Question text for display */
  text: string;
  /** binary = A/B choice, likert = 1-5 scale */
  type: QuestionType;
  /** If true, point values are reversed (5→1, 4→2, etc.) */
  reversed: boolean;
  /** For binary: { A: points, B: points }. For likert: standard or reversed based on flag */
  pointMap: Record<string, number>;
  /** Human-readable labels for each answer option (e.g. { A: "No Way", B: "Hell ya!" }) */
  optionLabels?: Record<string, string>;
}

// --- Non-scored question types ---

export type NonScoredQuestionType = 'binary' | 'scale' | 'rank' | 'open-ended' | 'multi-option' | 'matrix';

export interface NonScoredQuestion {
  order: number;
  ref: string;
  text: string;
  type: NonScoredQuestionType;
  category: string;
  construct?: string;
  options?: Record<string, string>;
  scaleMin?: number;
  scaleMax?: number;
  notes?: string;
}

export interface NonScoredCategory {
  key: string;
  label: string;
  description: string;
  questions: NonScoredQuestion[];
}

export interface SurveyQuestionsData {
  big5Personality: NonScoredCategory;
  personalityGames: NonScoredCategory;
  personalityScales: NonScoredCategory;
  howTools: NonScoredCategory;
  openEnded: NonScoredCategory;
}

export interface FourTypesQuestion {
  /** Position in survey (1-based) */
  order: number;
  /** Question reference ID */
  ref: string;
  /** Question text for display */
  text: string;
  /** Maps option letters (A/B/C/D) to animal types */
  optionToAnimal: Record<string, AnimalKey>;
  /** The letter order for this question's options (e.g. "ABCD", "DCAB") */
  letterOrder: string;
  /** Human-readable labels for each option (e.g. { A: "text...", B: "text..." }) */
  optionLabels?: Record<string, string>;
}

export interface TieBreakerConfig {
  /** Question reference ID for tie-breaker */
  ref: string;
  /** Question text */
  text: string;
  /** Maps option letters to animal types */
  optionToAnimal: Record<string, AnimalKey>;
  /** Human-readable labels for each option (e.g. { A: "Row #1", B: "Row #2" }) */
  optionLabels?: Record<string, string>;
}

export interface ThresholdConfig {
  /** Max score for "Low" level (inclusive) */
  lowMax: number;
  /** Max score for "Medium" level (inclusive) */
  mediumMax: number;
  // Anything above mediumMax is "High"
}

export interface ScoringConfigData {
  riskQuestions: RiskRewardQuestion[];
  rewardQuestions: RiskRewardQuestion[];
  fourTypesQuestions: FourTypesQuestion[];
  tieBreakerConfig: TieBreakerConfig;
  riskThresholds: ThresholdConfig;
  rewardThresholds: ThresholdConfig;
  surveyQuestions?: SurveyQuestionsData;
}

export interface AnimalTypeContentData {
  key: string;
  title: string;
  description: string;
  traits: string[];
}

export interface RiskLevelContentData {
  key: string;
  title: string;
  description: string;
}

export interface RewardLevelContentData {
  key: string;
  title: string;
  description: string;
}

export interface DriverContentData {
  key: string;
  title: string;
  description: string;
  questions: string[];
}

export interface AOIContentData {
  key: string;
  title: string;
  description: string;
  businesses: string[];
}

export interface StrategyContentData {
  key: string;
  title: string;
  description: string;
  actions: string[];
}

export interface AllContentData {
  animals: AnimalTypeContentData[];
  riskLevels: RiskLevelContentData[];
  rewardLevels: RewardLevelContentData[];
  drivers: DriverContentData[];
  aois: AOIContentData[];
  strategies: StrategyContentData[];
}

/** Result from the scoring engine */
export interface ScoringResult {
  riskScore: number;
  rewardScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  rewardLevel: 'Low' | 'Medium' | 'High';
  animalType: AnimalKey;
  /** Vote counts per animal from four-types questions */
  voteBreakdown: Record<AnimalKey, number>;
}
