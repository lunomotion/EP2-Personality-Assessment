// Form config loader with in-memory cache

import type { FormConfigData, FormSectionConfig, FormResultsConfig } from '@/types/form-config';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  loadedAt: number;
}

let formConfigCache: CacheEntry<FormConfigData> | null = null;

function isFresh<T>(entry: CacheEntry<T> | null): entry is CacheEntry<T> {
  return entry !== null && Date.now() - entry.loadedAt < CACHE_TTL_MS;
}

async function getPrisma() {
  if (!process.env.DATABASE_URL) return null;
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

/**
 * Load FormConfig from DB with caching.
 * Returns null if no config exists in DB.
 */
export async function getFormConfig(): Promise<FormConfigData | null> {
  if (isFresh(formConfigCache)) {
    return formConfigCache.data;
  }

  const prisma = await getPrisma();
  if (!prisma) return null;

  try {
    const row = await prisma.formConfig.findUnique({
      where: { id: 'default' },
    });
    if (!row) return null;

    const config: FormConfigData = {
      sections: row.sections as unknown as FormSectionConfig[],
      resultsPage: row.resultsPage as unknown as FormResultsConfig,
      backgroundImage: row.backgroundImage ?? undefined,
      isLive: row.isLive,
    };

    formConfigCache = { data: config, loadedAt: Date.now() };
    return config;
  } catch (err) {
    console.error('Failed to load FormConfig:', err);
    return null;
  }
}

/**
 * Invalidate form config cache. Call after admin saves.
 */
export function invalidateFormConfigCache(): void {
  formConfigCache = null;
}
