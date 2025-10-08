'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VolatilityData {
  symbol: string;
  name: string;
  volatility: {
    daily: number;
    annualized: number;
    coefficientOfVariation: number;
  };
}

interface VolatilityChartProps {
  data: VolatilityData[];
}

export function VolatilityChart({ data }: VolatilityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No volatility data available.
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.symbol,
    'Annualized Volatility': (item.volatility.annualized * 100).toFixed(2),
    'Daily Volatility': (item.volatility.daily * 100).toFixed(2),
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Volatility (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value: string) => `${parseFloat(value).toFixed(2)}%`}
          />
          <Legend />
          <Bar dataKey="Annualized Volatility" fill="#3b82f6" />
          <Bar dataKey="Daily Volatility" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 6).map(item => (
          <div key={item.symbol} className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold text-lg">{item.symbol}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.name}</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily:</span>
                <span className="font-medium">{(item.volatility.daily * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annualized:</span>
                <span className="font-medium">{(item.volatility.annualized * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CV:</span>
                <span className="font-medium">{item.volatility.coefficientOfVariation.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
