'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface VolumeData {
  date: string;
  volume: number;
  priceChange?: number;
}

interface VolumeChartProps {
  data: VolumeData[];
  title?: string;
}

export default function VolumeChart({ data, title = 'Trading Volume' }: VolumeChartProps) {
  const formatVolume = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            stroke="#9CA3AF"
          />
          <YAxis
            tickFormatter={formatVolume}
            tick={{ fontSize: 12 }}
            stroke="#9CA3AF"
          />
          <Tooltip
            formatter={(value: number) => [formatVolume(value), 'Volume']}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.priceChange && entry.priceChange >= 0 ? '#10B981' : '#EF4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
