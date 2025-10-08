import { calculateReturns, calculatePercentageChange } from '../calculations/returns';

describe('Returns Calculations', () => {
  describe('calculatePercentageChange', () => {
    test('calculates positive percentage change correctly', () => {
      const result = calculatePercentageChange(100, 150);
      expect(result).toBe(50);
    });

    test('calculates negative percentage change correctly', () => {
      const result = calculatePercentageChange(150, 100);
      expect(result).toBeCloseTo(-33.33, 1);
    });

    test('returns 0 for no change', () => {
      const result = calculatePercentageChange(100, 100);
      expect(result).toBe(0);
    });

    test('handles zero start value', () => {
      const result = calculatePercentageChange(0, 100);
      expect(result).toBe(0);
    });
  });

  describe('calculateReturns', () => {
    test('calculates daily returns for price series', () => {
      const prices = [100, 105, 103, 108];
      const result = calculateReturns(prices);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBeCloseTo(0.05, 2);
      expect(result[1]).toBeCloseTo(-0.019, 2);
      expect(result[2]).toBeCloseTo(0.0485, 2);
    });

    test('handles empty array', () => {
      const result = calculateReturns([]);
      expect(result).toEqual([]);
    });

    test('handles single value', () => {
      const result = calculateReturns([100]);
      expect(result).toEqual([]);
    });
  });
});
