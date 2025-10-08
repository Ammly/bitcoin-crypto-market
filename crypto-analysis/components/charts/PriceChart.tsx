'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface DataPoint {
  date: Date;
  close: number;
}

interface CryptoData {
  symbol: string;
  name: string;
  data: DataPoint[];
}

interface PriceChartProps {
  data: CryptoData[];
}

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export function PriceChart({ data }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-500">
        No data available. Select cryptocurrencies to view trends.
      </div>
    );
  }

  // Combine all data points by date
  const dateMap: { [key: string]: { date: string; [key: string]: number | string } } = {};
  
  data.forEach(crypto => {
    crypto.data.forEach(point => {
      const dateStr = format(new Date(point.date), 'yyyy-MM-dd');
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = { date: dateStr };
      }
      dateMap[dateStr][crypto.symbol] = point.close;
    });
  });

  const chartData = Object.values(dateMap).sort((a, b) => 
    new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
  );

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(new Date(value), 'MMM dd')}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value as string), 'PPP')}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
          />
          <Legend />
          {data.map((crypto, index) => (
            <Line
              key={crypto.symbol}
              type="monotone"
              dataKey={crypto.symbol}
              name={crypto.name}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
