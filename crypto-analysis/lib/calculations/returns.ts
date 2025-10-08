/**
 * Calculate daily returns from price data
 */
export function calculateReturns(prices: number[]): number[] {
  const returns: number[] = [];
  
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1];
    const currentPrice = prices[i];
    
    if (prevPrice && prevPrice !== 0) {
      returns.push((currentPrice - prevPrice) / prevPrice);
    } else {
      returns.push(0);
    }
  }
  
  return returns;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < window - 1) {
      result.push(NaN);
    } else {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  
  return result;
}

/**
 * Calculate cumulative returns
 */
export function calculateCumulativeReturns(returns: number[]): number[] {
  const cumulative: number[] = [];
  let cumulativeReturn = 1;
  
  for (const ret of returns) {
    cumulativeReturn *= (1 + ret);
    cumulative.push(cumulativeReturn - 1);
  }
  
  return cumulative;
}
