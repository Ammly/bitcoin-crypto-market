import { priceHistory } from '../db/schema';
import { calculateMovingAverage } from './returns';

type PriceData = typeof priceHistory.$inferSelect;

export interface PredictionData {
  date: string;
  predictedPrice: number;
  confidence: 'high' | 'medium' | 'low';
  method: string;
}

export interface PredictionResult {
  predictions: PredictionData[];
  currentPrice: number;
  predictedChange: number;
  predictedChangePercent: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  signals: string[];
}

/**
 * Simple moving average crossover prediction
 * Golden Cross: 50-day MA crosses above 200-day MA (bullish)
 * Death Cross: 50-day MA crosses below 200-day MA (bearish)
 */
export function predictWithMovingAverages(prices: PriceData[]): PredictionResult {
  if (prices.length < 200) {
    throw new Error('Insufficient data for prediction (need at least 200 days)');
  }

  const closePrices = prices.map(p => Number(p.close));
  const currentPrice = closePrices[closePrices.length - 1];

  // Calculate moving averages
  const sma50 = calculateMovingAverage(closePrices, 50);
  const sma200 = calculateMovingAverage(closePrices, 200);

  const currentSMA50 = sma50[sma50.length - 1];
  const currentSMA200 = sma200[sma200.length - 1];
  const prevSMA50 = sma50[sma50.length - 2];
  const prevSMA200 = sma200[sma200.length - 2];

  // Detect crossovers
  const signals: string[] = [];
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  // Check for golden cross or death cross
  if (currentSMA50 > currentSMA200 && prevSMA50 <= prevSMA200) {
    signals.push('Golden Cross detected - Strong bullish signal');
    trend = 'bullish';
  } else if (currentSMA50 < currentSMA200 && prevSMA50 >= prevSMA200) {
    signals.push('Death Cross detected - Strong bearish signal');
    trend = 'bearish';
  } else if (currentSMA50 > currentSMA200) {
    signals.push('Price above both moving averages - Bullish trend');
    trend = 'bullish';
  } else if (currentSMA50 < currentSMA200) {
    signals.push('Price below both moving averages - Bearish trend');
    trend = 'bearish';
  }

  // Calculate predicted price based on trend
  const momentum = currentSMA50 - prevSMA50;
  const predictions: PredictionData[] = [];

  for (let daysAhead = 1; daysAhead <= 30; daysAhead++) {
    let predictedPrice: number;
    let confidence: 'high' | 'medium' | 'low';

    if (daysAhead <= 7) {
      // Short-term: High confidence
      predictedPrice = currentPrice + (momentum * daysAhead * 0.8);
      confidence = 'high';
    } else if (daysAhead <= 14) {
      // Medium-term: Medium confidence
      predictedPrice = currentPrice + (momentum * daysAhead * 0.5);
      confidence = 'medium';
    } else {
      // Long-term: Low confidence
      predictedPrice = currentPrice + (momentum * daysAhead * 0.3);
      confidence = 'low';
    }

    const futureDate = new Date(prices[prices.length - 1].date);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedPrice: Math.max(predictedPrice, 0), // Ensure non-negative
      confidence,
      method: 'Moving Average Momentum',
    });
  }

  const futurePrice = predictions[6].predictedPrice; // 7-day prediction
  const predictedChange = futurePrice - currentPrice;
  const predictedChangePercent = (predictedChange / currentPrice) * 100;

  return {
    predictions,
    currentPrice,
    predictedChange,
    predictedChangePercent,
    trend,
    signals,
  };
}

/**
 * Linear regression prediction
 */
export function predictWithLinearRegression(prices: PriceData[], daysAhead: number = 7): PredictionResult {
  if (prices.length < 30) {
    throw new Error('Insufficient data for prediction (need at least 30 days)');
  }

  // Use last 60 days for regression
  const recentPrices = prices.slice(-60);
  const closePrices = recentPrices.map(p => Number(p.close));
  const currentPrice = closePrices[closePrices.length - 1];

  // Calculate linear regression
  const n = closePrices.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const yValues = closePrices;

  const sumX = xValues.reduce((sum, x) => sum + x, 0);
  const sumY = yValues.reduce((sum, y) => sum + y, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate predictions
  const predictions: PredictionData[] = [];
  const signals: string[] = [];

  for (let day = 1; day <= daysAhead; day++) {
    const x = n + day - 1;
    const predictedPrice = slope * x + intercept;

    let confidence: 'high' | 'medium' | 'low';
    if (day <= 3) {
      confidence = 'high';
    } else if (day <= 7) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }

    const futureDate = new Date(recentPrices[recentPrices.length - 1].date);
    futureDate.setDate(futureDate.getDate() + day);

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predictedPrice: Math.max(predictedPrice, 0),
      confidence,
      method: 'Linear Regression',
    });
  }

  const futurePrice = predictions[Math.min(6, predictions.length - 1)].predictedPrice;
  const predictedChange = futurePrice - currentPrice;
  const predictedChangePercent = (predictedChange / currentPrice) * 100;

  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (slope > 0) {
    trend = 'bullish';
    signals.push(`Positive trend detected (slope: ${slope.toFixed(4)})`);
  } else if (slope < 0) {
    trend = 'bearish';
    signals.push(`Negative trend detected (slope: ${slope.toFixed(4)})`);
  } else {
    signals.push('Sideways trend detected');
  }

  return {
    predictions,
    currentPrice,
    predictedChange,
    predictedChangePercent,
    trend,
    signals,
  };
}

/**
 * Ensemble prediction combining multiple methods
 */
export function predictWithEnsemble(prices: PriceData[]): PredictionResult {
  try {
    const maPrediction = predictWithMovingAverages(prices);
    const lrPrediction = predictWithLinearRegression(prices, 30);

    // Combine predictions (weighted average)
    const predictions: PredictionData[] = [];
    for (let i = 0; i < Math.min(maPrediction.predictions.length, lrPrediction.predictions.length); i++) {
      const maPrice = maPrediction.predictions[i].predictedPrice;
      const lrPrice = lrPrediction.predictions[i].predictedPrice;

      // Weight: 60% MA, 40% LR (MA tends to be more stable)
      const ensemblePrice = maPrice * 0.6 + lrPrice * 0.4;

      predictions.push({
        date: maPrediction.predictions[i].date,
        predictedPrice: ensemblePrice,
        confidence: maPrediction.predictions[i].confidence,
        method: 'Ensemble (MA + Linear Regression)',
      });
    }

    const currentPrice = maPrediction.currentPrice;
    const futurePrice = predictions[6].predictedPrice;
    const predictedChange = futurePrice - currentPrice;
    const predictedChangePercent = (predictedChange / currentPrice) * 100;

    // Combine signals
    const signals = [
      ...maPrediction.signals,
      ...lrPrediction.signals,
    ];

    // Determine consensus trend
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (maPrediction.trend === lrPrediction.trend) {
      trend = maPrediction.trend;
    } else {
      signals.push('Mixed signals - Neutral stance recommended');
    }

    return {
      predictions,
      currentPrice,
      predictedChange,
      predictedChangePercent,
      trend,
      signals,
    };
  } catch {
    // Fallback to linear regression if MA fails
    return predictWithLinearRegression(prices, 30);
  }
}
