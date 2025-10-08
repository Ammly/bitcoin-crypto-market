'use client';

import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import type { PredictionResult } from '@/lib/calculations/predictions';

interface PredictionChartProps {
  prediction: PredictionResult;
  cryptoSymbol: string;
}

export function PredictionChart({ prediction, cryptoSymbol }: PredictionChartProps) {
  const { predictions, currentPrice, trend, signals } = prediction;
  
  // Combine historical and predicted data
  const chartData = predictions.map(p => ({
    date: p.date,
    price: p.predictedPrice,
    confidence: p.confidence,
    type: 'prediction',
  }));
  
  // Get trend emoji and color
  const getTrendDisplay = () => {
    switch (trend) {
      case 'bullish':
        return { emoji: '📈', text: 'Bullish', color: 'text-green-600' };
      case 'bearish':
        return { emoji: '📉', text: 'Bearish', color: 'text-red-600' };
      default:
        return { emoji: '➡️', text: 'Neutral', color: 'text-gray-600' };
    }
  };
  
  const trendDisplay = getTrendDisplay();
  
  // Calculate price change
  const lastPrediction = predictions[predictions.length - 1];
  const priceChange = lastPrediction.predictedPrice - currentPrice;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Current Price</div>
          <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">30-Day Prediction</div>
          <div className="text-2xl font-bold">${lastPrediction.predictedPrice.toFixed(2)}</div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Trend</div>
          <div className={`text-2xl font-bold ${trendDisplay.color}`}>
            {trendDisplay.emoji} {trendDisplay.text}
          </div>
        </div>
      </div>
      
      {/* Prediction Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">
          {cryptoSymbol} - 30-Day Price Prediction
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Predicted Price']}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString();
              }}
            />
            <Legend />
            
            {/* Reference line at current price */}
            <ReferenceLine
              y={currentPrice}
              stroke="#666"
              strokeDasharray="5 5"
              label={{ value: 'Current', position: 'right' }}
            />
            
            {/* Prediction line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              name="Predicted Price"
            />
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Confidence Legend */}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>High Confidence (1-7 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium Confidence (8-14 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Low Confidence (15-30 days)</span>
          </div>
        </div>
      </div>
      
      {/* Signals */}
      {signals.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Trading Signals</h3>
          <div className="space-y-3">
            {signals.map((signal, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">{signal}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Insights */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-900">Key Insights</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>
            • The current price is ${currentPrice.toFixed(2)}
          </li>
          <li>
            • The model predicts a 30-day price of ${lastPrediction.predictedPrice.toFixed(2)}, 
            representing a {priceChangePercent >= 0 ? 'gain' : 'loss'} of {Math.abs(priceChangePercent).toFixed(2)}%
          </li>
          <li>
            • Overall trend is {trend}
          </li>
          {signals.length > 0 && (
            <li>
              • {signals.length} trading {signals.length === 1 ? 'signal' : 'signals'} detected - 
              review the signals section for actionable insights
            </li>
          )}
        </ul>
      </div>
      
      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex gap-2">
          <span className="text-yellow-600 font-bold">⚠️</span>
          <div className="text-sm text-yellow-800">
            <strong>Disclaimer:</strong> These predictions are based on historical data and technical 
            analysis using moving averages and linear regression. They should not be considered as 
            financial advice. Cryptocurrency markets are highly volatile and unpredictable. 
            Always do your own research and consult with financial advisors before making 
            investment decisions.
          </div>
        </div>
      </div>
    </div>
  );
}
