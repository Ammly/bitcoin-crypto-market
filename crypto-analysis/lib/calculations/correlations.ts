/**
 * Calculate Pearson correlation coefficient between two arrays
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  
  return numerator / denominator;
}

/**
 * Calculate correlation matrix for multiple series
 */
export function calculateCorrelationMatrix(
  data: { [key: string]: number[] }
): { [key: string]: { [key: string]: number } } {
  const keys = Object.keys(data);
  const matrix: { [key: string]: { [key: string]: number } } = {};
  
  for (const key1 of keys) {
    matrix[key1] = {};
    for (const key2 of keys) {
      matrix[key1][key2] = calculateCorrelation(data[key1], data[key2]);
    }
  }
  
  return matrix;
}

/**
 * Find the pairs with strongest correlations
 */
export function findStrongestCorrelations(
  matrix: { [key: string]: { [key: string]: number } },
  limit: number = 10
): Array<{ pair: [string, string]; correlation: number }> {
  const correlations: Array<{ pair: [string, string]; correlation: number }> = [];
  const keys = Object.keys(matrix);
  
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const key1 = keys[i];
      const key2 = keys[j];
      correlations.push({
        pair: [key1, key2],
        correlation: matrix[key1][key2],
      });
    }
  }
  
  // Sort by absolute correlation value
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  
  return correlations.slice(0, limit);
}
