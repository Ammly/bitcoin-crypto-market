'use client';

import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DominanceData {
  date: string;
  bitcoinMarketCap: number;
  totalMarketCap: number;
  dominancePercentage: number;
  altcoinMarketCap: number;
}

interface DominanceStats {
  currentDominance: number;
  averageDominance: number;
  maxDominance: number;
  minDominance: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface DominanceChartProps {
  data: DominanceData[];
  stats: DominanceStats;
}

export function DominanceChart({ data, stats }: DominanceChartProps) {
  // Format data for the chart
  const chartData = data.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Bitcoin': d.dominancePercentage,
    'Altcoins': 100 - d.dominancePercentage,
    fullDate: d.date,
    btcMarketCap: d.bitcoinMarketCap,
    altMarketCap: d.altcoinMarketCap,
  }));

  const trendIcon = {
    increasing: '📈',
    decreasing: '📉',
    stable: '➡️',
  }[stats.trend];

  const trendColor = {
    increasing: 'text-green-600',
    decreasing: 'text-red-600',
    stable: 'text-gray-600',
  }[stats.trend];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Bitcoin Market Dominance</h2>
        <p className="text-sm text-gray-600">
          Bitcoin&apos;s share of the total cryptocurrency market capitalization
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Current</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.currentDominance.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Average</p>
          <p className="text-2xl font-bold text-gray-700">
            {stats.averageDominance.toFixed(2)}%
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Peak</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.maxDominance.toFixed(2)}%
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 mb-1">Trend</p>
          <p className={`text-xl font-bold ${trendColor}`}>
            {trendIcon} {stats.trend}
          </p>
        </div>
      </div>

      {/* Stacked Area Chart */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Share Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="Bitcoin" 
              stackId="1"
              stroke="#f7931a" 
              fill="#f7931a"
              fillOpacity={0.8}
            />
            <Area 
              type="monotone" 
              dataKey="Altcoins" 
              stackId="1"
              stroke="#627eea" 
              fill="#627eea"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bitcoin Dominance Line Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Bitcoin Dominance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="Bitcoin" 
              stroke="#f7931a" 
              strokeWidth={2}
              dot={false}
              name="BTC Dominance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Insights</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Bitcoin currently represents {stats.currentDominance.toFixed(1)}% of the total crypto market</li>
          <li>• Dominance has ranged from {stats.minDominance.toFixed(1)}% to {stats.maxDominance.toFixed(1)}% in this period</li>
          <li>• Overall trend is {stats.trend === 'increasing' ? 'upward' : stats.trend === 'decreasing' ? 'downward' : 'relatively stable'}</li>
          <li>• Higher dominance typically indicates Bitcoin is outperforming altcoins</li>
        </ul>
      </div>
    </div>
  );
}
