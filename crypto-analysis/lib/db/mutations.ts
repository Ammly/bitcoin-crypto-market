import { db } from './index';
import { cryptocurrencies, priceHistory, analysisCache, NewCryptocurrency, NewPriceHistory, NewAnalysisCache } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Create or update a cryptocurrency
 */
export async function upsertCryptocurrency(data: NewCryptocurrency) {
  const [existing] = await db
    .select()
    .from(cryptocurrencies)
    .where(eq(cryptocurrencies.symbol, data.symbol));

  if (existing) {
    return existing;
  }

  const [created] = await db.insert(cryptocurrencies).values(data).returning();
  return created;
}

/**
 * Batch insert price history
 */
export async function insertPriceHistory(data: NewPriceHistory[]) {
  if (data.length === 0) return [];
  
  // Insert in chunks to avoid query size limits
  const chunkSize = 1000;
  const results = [];
  
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const inserted = await db.insert(priceHistory).values(chunk).returning();
    results.push(...inserted);
  }
  
  return results;
}

/**
 * Delete all price history for a cryptocurrency
 */
export async function deletePriceHistory(cryptoId: number) {
  await db.delete(priceHistory).where(eq(priceHistory.cryptoId, cryptoId));
}

/**
 * Save analysis to cache
 */
export async function saveAnalysisCache(data: NewAnalysisCache) {
  const [cached] = await db.insert(analysisCache).values(data).returning();
  return cached;
}

/**
 * Delete old cached analyses (older than 24 hours)
 */
export async function cleanOldCache() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await db.delete(analysisCache).where(eq(analysisCache.createdAt, oneDayAgo));
}
