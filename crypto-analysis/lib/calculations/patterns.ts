import { priceHistory } from '../db/schema';

type PriceData = typeof priceHistory.$inferSelect;

export interface SeasonalData {
  period: string; // e.g., "January", "Q1", "Monday"
  averageReturn: number;
  medianReturn: number;
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  winRate: number; // percentage of positive returns
}

export interface MonthlyPattern {
  month: number;
  monthName: string;
  data: SeasonalData;
}

export interface QuarterlyPattern {
  quarter: number;
  quarterName: string;
  data: SeasonalData;
}

export interface DayOfWeekPattern {
  dayIndex: number;
  dayName: string;
  data: SeasonalData;
}

/**
 * Calculate statistics for a set of returns
 */
function calculateSeasonalStats(returns: number[], period: string): SeasonalData {
  if (returns.length === 0) {
    return {
      period,
      averageReturn: 0,
      medianReturn: 0,
      positiveCount: 0,
      negativeCount: 0,
      totalCount: 0,
      winRate: 0,
    };
  }
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const median = sortedReturns[Math.floor(sortedReturns.length / 2)];
  const average = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const positiveCount = returns.filter(r => r > 0).length;
  const negativeCount = returns.filter(r => r < 0).length;
  
  return {
    period,
    averageReturn: average,
    medianReturn: median,
    positiveCount,
    negativeCount,
    totalCount: returns.length,
    winRate: (positiveCount / returns.length) * 100,
  };
}

/**
 * Analyze monthly patterns
 */
export function analyzeMonthlyPatterns(prices: PriceData[]): MonthlyPattern[] {
  const monthlyReturns = new Map<number, number[]>();
  
  // Initialize all months
  for (let m = 0; m < 12; m++) {
    monthlyReturns.set(m, []);
  }
  
  // Group returns by month
  for (let i = 1; i < prices.length; i++) {
    const currentDate = prices[i].date instanceof Date ? prices[i].date : new Date(prices[i].date);
    const prevClose = Number(prices[i - 1].close);
    const currentClose = Number(prices[i].close);
    
    if (prevClose > 0) {
      const returnPct = ((currentClose - prevClose) / prevClose) * 100;
      const month = currentDate.getMonth();
      monthlyReturns.get(month)!.push(returnPct);
    }
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return Array.from(monthlyReturns.entries()).map(([month, returns]) => ({
    month: month + 1,
    monthName: monthNames[month],
    data: calculateSeasonalStats(returns, monthNames[month]),
  }));
}

/**
 * Analyze quarterly patterns
 */
export function analyzeQuarterlyPatterns(prices: PriceData[]): QuarterlyPattern[] {
  const quarterlyReturns = new Map<number, number[]>();
  
  // Initialize all quarters
  for (let q = 0; q < 4; q++) {
    quarterlyReturns.set(q, []);
  }
  
  // Group returns by quarter
  for (let i = 1; i < prices.length; i++) {
    const currentDate = prices[i].date instanceof Date ? prices[i].date : new Date(prices[i].date);
    const prevClose = Number(prices[i - 1].close);
    const currentClose = Number(prices[i].close);
    
    if (prevClose > 0) {
      const returnPct = ((currentClose - prevClose) / prevClose) * 100;
      const quarter = Math.floor(currentDate.getMonth() / 3);
      quarterlyReturns.get(quarter)!.push(returnPct);
    }
  }
  
  return Array.from(quarterlyReturns.entries()).map(([quarter, returns]) => ({
    quarter: quarter + 1,
    quarterName: `Q${quarter + 1}`,
    data: calculateSeasonalStats(returns, `Q${quarter + 1}`),
  }));
}

/**
 * Analyze day of week patterns
 */
export function analyzeDayOfWeekPatterns(prices: PriceData[]): DayOfWeekPattern[] {
  const dayReturns = new Map<number, number[]>();
  
  // Initialize all days
  for (let d = 0; d < 7; d++) {
    dayReturns.set(d, []);
  }
  
  // Group returns by day of week
  for (let i = 1; i < prices.length; i++) {
    const currentDate = prices[i].date instanceof Date ? prices[i].date : new Date(prices[i].date);
    const prevClose = Number(prices[i - 1].close);
    const currentClose = Number(prices[i].close);
    
    if (prevClose > 0) {
      const returnPct = ((currentClose - prevClose) / prevClose) * 100;
      const dayOfWeek = currentDate.getDay();
      dayReturns.get(dayOfWeek)!.push(returnPct);
    }
  }
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return Array.from(dayReturns.entries()).map(([dayIndex, returns]) => ({
    dayIndex,
    dayName: dayNames[dayIndex],
    data: calculateSeasonalStats(returns, dayNames[dayIndex]),
  }));
}

/**
 * Find the best and worst performing periods
 */
export function findBestWorstPeriods(patterns: (MonthlyPattern | QuarterlyPattern | DayOfWeekPattern)[]) {
  if (patterns.length === 0) {
    return { best: null, worst: null };
  }
  
  const sorted = [...patterns].sort((a, b) => b.data.averageReturn - a.data.averageReturn);
  
  return {
    best: sorted[0],
    worst: sorted[sorted.length - 1],
  };
}
