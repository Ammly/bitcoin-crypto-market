/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculate rolling volatility
 */
export function calculateRollingVolatility(
  returns: number[],
  window: number,
  annualizationFactor: number = Math.sqrt(252)
): number[] {
  const volatilities: number[] = [];
  
  for (let i = 0; i < returns.length; i++) {
    if (i < window - 1) {
      volatilities.push(NaN);
    } else {
      const windowReturns = returns.slice(i - window + 1, i + 1);
      const volatility = calculateStandardDeviation(windowReturns) * annualizationFactor;
      volatilities.push(volatility);
    }
  }
  
  return volatilities;
}

/**
 * Calculate coefficient of variation
 */
export function calculateCoefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (mean === 0) return 0;
  
  const stdDev = calculateStandardDeviation(values);
  return stdDev / Math.abs(mean);
}

/**
 * Calculate annualized volatility
 */
export function calculateAnnualizedVolatility(
  returns: number[],
  periodsPerYear: number = 252
): number {
  const stdDev = calculateStandardDeviation(returns);
  return stdDev * Math.sqrt(periodsPerYear);
}
