// Server-side scoring engine - pure functions, no DB dependency

import type {
  RiskRewardQuestion,
  FourTypesQuestion,
  TieBreakerConfig,
  ThresholdConfig,
  AnimalKey,
  ScoringResult,
  ScoringConfigData,
} from '@/types/scoring';

/**
 * Calculate risk score from answers and question config.
 * Returns a number in the 10-50 range.
 */
export function calculateRiskScore(
  answers: Map<string, string | number>,
  questions: RiskRewardQuestion[]
): number {
  return calculateRiskRewardScore(answers, questions);
}

/**
 * Calculate reward score from answers and question config.
 * Returns a number in the 10-50 range.
 */
export function calculateRewardScore(
  answers: Map<string, string | number>,
  questions: RiskRewardQuestion[]
): number {
  return calculateRiskRewardScore(answers, questions);
}

function calculateRiskRewardScore(
  answers: Map<string, string | number>,
  questions: RiskRewardQuestion[]
): number {
  let total = 0;
  for (const q of questions) {
    const answer = answers.get(q.ref);
    if (answer === undefined || answer === null) {
      // Default to middle value if missing
      total += 3;
      continue;
    }
    const key = String(answer);
    const points = q.pointMap[key];
    if (points !== undefined) {
      total += points;
    } else {
      // Fallback: middle value
      total += 3;
    }
  }
  return total;
}

/**
 * Determine animal type from four-types question answers.
 * Counts votes per animal across 10 questions, applies tie-breaking.
 */
export function determineAnimalType(
  answers: Map<string, string | number>,
  questions: FourTypesQuestion[],
  tieBreakerConfig: TieBreakerConfig
): { animalType: AnimalKey; voteBreakdown: Record<AnimalKey, number> } {
  const votes: Record<AnimalKey, number> = {
    'African Dog': 0,
    Lion: 0,
    'Killer Whale': 0,
    Tiger: 0,
  };

  for (const q of questions) {
    const answer = answers.get(q.ref);
    if (answer === undefined || answer === null) continue;
    const letter = String(answer).toUpperCase();
    const animal = q.optionToAnimal[letter];
    if (animal) {
      votes[animal]++;
    }
  }

  // Find max vote count
  const maxVotes = Math.max(...Object.values(votes));
  const tied = (Object.keys(votes) as AnimalKey[]).filter(
    (a) => votes[a] === maxVotes
  );

  if (tied.length === 1) {
    return { animalType: tied[0], voteBreakdown: votes };
  }

  // Tie-break logic
  const tbAnswer = answers.get(tieBreakerConfig.ref);
  if (tbAnswer !== undefined && tbAnswer !== null) {
    const tbLetter = String(tbAnswer).toUpperCase();
    const tbAnimal = tieBreakerConfig.optionToAnimal[tbLetter];
    if (tbAnimal && tied.includes(tbAnimal)) {
      // Exact match in tied set
      return { animalType: tbAnimal, voteBreakdown: votes };
    }
    // If tie-breaker animal is NOT in tied set, move UP to the closest tied animal
    // "Up" order: African Dog < Lion < Killer Whale < Tiger
    if (tbAnimal) {
      const animalOrder: AnimalKey[] = [
        'African Dog',
        'Lion',
        'Killer Whale',
        'Tiger',
      ];
      const tbIndex = animalOrder.indexOf(tbAnimal);
      // Search upward (higher index) first, then wrap around
      for (let offset = 1; offset <= 4; offset++) {
        const checkIndex = (tbIndex + offset) % 4;
        const candidate = animalOrder[checkIndex];
        if (tied.includes(candidate)) {
          return { animalType: candidate, voteBreakdown: votes };
        }
      }
    }
  }

  // Final fallback: first tied animal in order
  const animalOrder: AnimalKey[] = [
    'African Dog',
    'Lion',
    'Killer Whale',
    'Tiger',
  ];
  for (const a of animalOrder) {
    if (tied.includes(a)) {
      return { animalType: a, voteBreakdown: votes };
    }
  }

  return { animalType: 'Lion', voteBreakdown: votes };
}

/**
 * Classify a numeric score into Low/Medium/High based on threshold config.
 */
export function classifyLevel(
  score: number,
  thresholds: ThresholdConfig
): 'Low' | 'Medium' | 'High' {
  if (score <= thresholds.lowMax) return 'Low';
  if (score <= thresholds.mediumMax) return 'Medium';
  return 'High';
}

/**
 * Full scoring pipeline: takes all answers and config, returns complete scoring result.
 */
export function runScoringEngine(
  answers: Map<string, string | number>,
  config: ScoringConfigData
): ScoringResult {
  const riskScore = calculateRiskScore(answers, config.riskQuestions);
  const rewardScore = calculateRewardScore(answers, config.rewardQuestions);
  const riskLevel = classifyLevel(riskScore, config.riskThresholds);
  const rewardLevel = classifyLevel(rewardScore, config.rewardThresholds);
  const { animalType, voteBreakdown } = determineAnimalType(
    answers,
    config.fourTypesQuestions,
    config.tieBreakerConfig
  );

  return {
    riskScore,
    rewardScore,
    riskLevel,
    rewardLevel,
    animalType,
    voteBreakdown,
  };
}
