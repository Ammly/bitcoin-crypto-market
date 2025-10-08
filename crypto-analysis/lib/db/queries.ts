import { db } from './index';
import { cryptocurrencies, priceHistory, analysisCache } from './schema';
import { eq, and, gte, lte, inArray, desc, sql } from 'drizzle-orm';

/**
 * Get all cryptocurrencies
 */
export async function getCryptocurrencies() {
  return await db.select().from(cryptocurrencies).orderBy(cryptocurrencies.name);
}

/**
 * Get cryptocurrency by ID
 */
export async function getCryptocurrencyById(id: number) {
  const [crypto] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.id, id));
  return crypto;
}

/**
 * Get cryptocurrency by symbol
 */
export async function getCryptocurrencyBySymbol(symbol: string) {
  const [crypto] = await db.select().from(cryptocurrencies).where(eq(cryptocurrencies.symbol, symbol));
  return crypto;
}

/**
 * Get price history for a cryptocurrency within a date range
 */
export async function getPriceHistory(
  cryptoId: number,
  startDate: Date,
  endDate: Date
) {
  return await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.cryptoId, cryptoId),
        gte(priceHistory.date, startDate),
        lte(priceHistory.date, endDate)
      )
    )
    .orderBy(priceHistory.date);
}

/**
 * Get price history for multiple cryptocurrencies
 * If cryptoIds is empty, returns all cryptocurrencies
 */
export async function getPriceHistoryMultiple(
  cryptoIds: number[],
  startDate: Date,
  endDate: Date
) {
  const conditions = [
    gte(priceHistory.date, startDate),
    lte(priceHistory.date, endDate)
  ];
  
  if (cryptoIds.length > 0) {
    conditions.push(inArray(priceHistory.cryptoId, cryptoIds));
  }
  
  return await db
    .select()
    .from(priceHistory)
    .where(and(...conditions))
    .orderBy(priceHistory.cryptoId, priceHistory.date);
}

/**
 * Get the latest price for each cryptocurrency
 */
export async function getLatestPrices(cryptoIds?: number[]) {
  const latestPricesSubquery = db
    .select({
      cryptoId: priceHistory.cryptoId,
      maxDate: sql<Date>`MAX(${priceHistory.date})`.as('max_date'),
    })
    .from(priceHistory)
    .where(cryptoIds ? inArray(priceHistory.cryptoId, cryptoIds) : undefined)
    .groupBy(priceHistory.cryptoId)
    .as('latest');

  return await db
    .select({
      id: priceHistory.id,
      cryptoId: priceHistory.cryptoId,
      date: priceHistory.date,
      open: priceHistory.open,
      high: priceHistory.high,
      low: priceHistory.low,
      close: priceHistory.close,
      volume: priceHistory.volume,
      marketCap: priceHistory.marketCap,
      symbol: cryptocurrencies.symbol,
      name: cryptocurrencies.name,
    })
    .from(priceHistory)
    .innerJoin(
      latestPricesSubquery,
      and(
        eq(priceHistory.cryptoId, latestPricesSubquery.cryptoId),
        eq(priceHistory.date, latestPricesSubquery.maxDate)
      )
    )
    .innerJoin(cryptocurrencies, eq(priceHistory.cryptoId, cryptocurrencies.id));
}

/**
 * Get market caps for a specific date
 */
export async function getMarketCaps(date: Date) {
  return await db
    .select({
      cryptoId: priceHistory.cryptoId,
      symbol: cryptocurrencies.symbol,
      name: cryptocurrencies.name,
      marketCap: priceHistory.marketCap,
      close: priceHistory.close,
    })
    .from(priceHistory)
    .innerJoin(cryptocurrencies, eq(priceHistory.cryptoId, cryptocurrencies.id))
    .where(eq(priceHistory.date, date))
    .orderBy(desc(priceHistory.marketCap));
}

/**
 * Get total market cap for a date range
 */
export async function getTotalMarketCapOverTime(startDate: Date, endDate: Date) {
  return await db
    .select({
      date: priceHistory.date,
      totalMarketCap: sql<string>`SUM(${priceHistory.marketCap})`.as('total_market_cap'),
    })
    .from(priceHistory)
    .where(and(gte(priceHistory.date, startDate), lte(priceHistory.date, endDate)))
    .groupBy(priceHistory.date)
    .orderBy(priceHistory.date);
}

/**
 * Get analysis from cache
 */
export async function getAnalysisCache(
  analysisType: string,
  cryptoIds: string,
  dateRange: string
) {
  const [cached] = await db
    .select()
    .from(analysisCache)
    .where(
      and(
        eq(analysisCache.analysisType, analysisType),
        eq(analysisCache.cryptoIds, cryptoIds),
        eq(analysisCache.dateRange, dateRange)
      )
    )
    .orderBy(desc(analysisCache.createdAt))
    .limit(1);
  
  return cached;
}

/**
 * Get price data with cryptocurrency details
 */
export async function getPriceDataWithCrypto(
  cryptoIds: number[],
  startDate: Date,
  endDate: Date
) {
  return await db
    .select({
      id: priceHistory.id,
      cryptoId: priceHistory.cryptoId,
      date: priceHistory.date,
      open: priceHistory.open,
      high: priceHistory.high,
      low: priceHistory.low,
      close: priceHistory.close,
      volume: priceHistory.volume,
      marketCap: priceHistory.marketCap,
      symbol: cryptocurrencies.symbol,
      name: cryptocurrencies.name,
    })
    .from(priceHistory)
    .innerJoin(cryptocurrencies, eq(priceHistory.cryptoId, cryptocurrencies.id))
    .where(
      and(
        inArray(priceHistory.cryptoId, cryptoIds),
        gte(priceHistory.date, startDate),
        lte(priceHistory.date, endDate)
      )
    )
    .orderBy(priceHistory.date, priceHistory.cryptoId);
}
