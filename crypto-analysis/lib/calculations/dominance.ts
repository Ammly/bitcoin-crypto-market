import { priceHistory } from '../db/schema';

type PriceData = typeof priceHistory.$inferSelect;

export interface DominanceData {
  date: string;
  bitcoinMarketCap: number;
  totalMarketCap: number;
  dominancePercentage: number;
  altcoinMarketCap: number;
}

/**
 * Calculate Bitcoin dominance over time
 * Bitcoin dominance = (Bitcoin Market Cap / Total Market Cap) * 100
 */
export function calculateBitcoinDominance(
  bitcoinPrices: PriceData[],
  allPrices: PriceData[]
): DominanceData[] {
  // Group all prices by date
  const pricesByDate = new Map<string, PriceData[]>();
  
  for (const price of allPrices) {
    const dateKey = price.date instanceof Date ? price.date.toISOString().split('T')[0] : String(price.date);
    if (!pricesByDate.has(dateKey)) {
      pricesByDate.set(dateKey, []);
    }
    pricesByDate.get(dateKey)!.push(price);
  }
  
  const dominanceData: DominanceData[] = [];
  
  // For each Bitcoin price point, calculate dominance
  for (const btcPrice of bitcoinPrices) {
    const dateKey = btcPrice.date instanceof Date ? btcPrice.date.toISOString().split('T')[0] : String(btcPrice.date);
    const pricesOnDate = pricesByDate.get(dateKey);
    
    if (!pricesOnDate || pricesOnDate.length === 0) {
      continue;
    }
    
    // Calculate total market cap for this date
    const totalMarketCap = pricesOnDate.reduce(
      (sum, p) => sum + Number(p.marketCap || 0),
      0
    );
    
    const bitcoinMarketCap = Number(btcPrice.marketCap || 0);
    const altcoinMarketCap = totalMarketCap - bitcoinMarketCap;
    
    if (totalMarketCap > 0) {
      dominanceData.push({
        date: dateKey,
        bitcoinMarketCap,
        totalMarketCap,
        altcoinMarketCap,
        dominancePercentage: (bitcoinMarketCap / totalMarketCap) * 100,
      });
    }
  }
  
  return dominanceData.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate summary statistics for Bitcoin dominance
 */
export function calculateDominanceStats(dominanceData: DominanceData[]) {
  if (dominanceData.length === 0) {
    return {
      currentDominance: 0,
      averageDominance: 0,
      maxDominance: 0,
      minDominance: 0,
      trend: 'stable' as 'increasing' | 'decreasing' | 'stable',
    };
  }
  
  const dominanceValues = dominanceData.map(d => d.dominancePercentage);
  const currentDominance = dominanceValues[dominanceValues.length - 1];
  const averageDominance =
    dominanceValues.reduce((sum, val) => sum + val, 0) / dominanceValues.length;
  const maxDominance = Math.max(...dominanceValues);
  const minDominance = Math.min(...dominanceValues);
  
  // Calculate trend (compare first 10% vs last 10% of data)
  const sampleSize = Math.max(1, Math.floor(dominanceValues.length * 0.1));
  const firstAvg =
    dominanceValues.slice(0, sampleSize).reduce((sum, val) => sum + val, 0) /
    sampleSize;
  const lastAvg =
    dominanceValues
      .slice(-sampleSize)
      .reduce((sum, val) => sum + val, 0) / sampleSize;
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  const trendThreshold = 2; // 2% change to consider as trend
  
  if (lastAvg - firstAvg > trendThreshold) {
    trend = 'increasing';
  } else if (firstAvg - lastAvg > trendThreshold) {
    trend = 'decreasing';
  }
  
  return {
    currentDominance,
    averageDominance,
    maxDominance,
    minDominance,
    trend,
  };
}
