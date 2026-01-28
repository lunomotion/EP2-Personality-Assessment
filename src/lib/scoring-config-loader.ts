// Scoring config loader with in-memory cache

import type {
  ScoringConfigData,
  AllContentData,
  RiskRewardQuestion,
  FourTypesQuestion,
  TieBreakerConfig,
  ThresholdConfig,
  SurveyQuestionsData,
} from '@/types/scoring';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  loadedAt: number;
}

let scoringConfigCache: CacheEntry<ScoringConfigData> | null = null;
let contentConfigCache: CacheEntry<AllContentData> | null = null;

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() - entry.loadedAt < CACHE_TTL_MS;
}

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

/**
 * Load ScoringConfig from DB with caching.
 * Returns null if no config exists in DB.
 */
export async function getScoringConfig(): Promise<ScoringConfigData | null> {
  if (isFresh(scoringConfigCache)) {
    return scoringConfigCache.data;
  }

  const prisma = await getPrisma();
  if (!prisma) return null;

  try {
    const row = await prisma.scoringConfig.findUnique({
      where: { id: 'default' },
    });
    if (!row) return null;

    const config: ScoringConfigData = {
      riskQuestions: row.riskQuestions as unknown as RiskRewardQuestion[],
      rewardQuestions: row.rewardQuestions as unknown as RiskRewardQuestion[],
      fourTypesQuestions: row.fourTypesQuestions as unknown as FourTypesQuestion[],
      tieBreakerConfig: row.tieBreakerConfig as unknown as TieBreakerConfig,
      riskThresholds: row.riskThresholds as unknown as ThresholdConfig,
      rewardThresholds: row.rewardThresholds as unknown as ThresholdConfig,
      surveyQuestions: row.surveyQuestions as unknown as SurveyQuestionsData | undefined,
    };

    scoringConfigCache = { data: config, loadedAt: Date.now() };
    return config;
  } catch (err) {
    console.error('Failed to load ScoringConfig:', err);
    return null;
  }
}

/**
 * Load all content tables from DB with caching.
 * Returns null if DB unavailable.
 */
export async function getContentConfig(): Promise<AllContentData | null> {
  if (isFresh(contentConfigCache)) {
    return contentConfigCache.data;
  }

  const prisma = await getPrisma();
  if (!prisma) return null;

  try {
    const [animals, riskLevels, rewardLevels, drivers, aois, strategies] =
      await Promise.all([
        prisma.animalTypeContent.findMany(),
        prisma.riskLevelContent.findMany(),
        prisma.rewardLevelContent.findMany(),
        prisma.driverContent.findMany(),
        prisma.aOIContent.findMany(),
        prisma.strategyContent.findMany(),
      ]);

    const content: AllContentData = {
      animals: animals.map((a) => ({
        key: a.key,
        title: a.title,
        description: a.description,
        traits: a.traits,
      })),
      riskLevels: riskLevels.map((r) => ({
        key: r.key,
        title: r.title,
        description: r.description,
      })),
      rewardLevels: rewardLevels.map((r) => ({
        key: r.key,
        title: r.title,
        description: r.description,
      })),
      drivers: drivers.map((d) => ({
        key: d.key,
        title: d.title,
        description: d.description,
        questions: d.questions,
      })),
      aois: aois.map((a) => ({
        key: a.key,
        title: a.title,
        description: a.description,
        businesses: a.businesses,
      })),
      strategies: strategies.map((s) => ({
        key: s.key,
        title: s.title,
        description: s.description,
        actions: s.actions,
      })),
    };

    contentConfigCache = { data: content, loadedAt: Date.now() };
    return content;
  } catch (err) {
    console.error('Failed to load content config:', err);
    return null;
  }
}

/**
 * Invalidate all caches. Call after admin saves.
 */
export function invalidateCache(): void {
  scoringConfigCache = null;
  contentConfigCache = null;
}
