'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SeasonalData {
  period: string;
  averageReturn: number;
  medianReturn: number;
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  winRate: number;
}

interface MonthlyPattern {
  month: number;
  monthName: string;
  data: SeasonalData;
}

interface QuarterlyPattern {
  quarter: number;
  quarterName: string;
  data: SeasonalData;
}

interface DayOfWeekPattern {
  dayIndex: number;
  dayName: string;
  data: SeasonalData;
}

interface SeasonalChartProps {
  monthly: MonthlyPattern[];
  quarterly: QuarterlyPattern[];
  dayOfWeek: DayOfWeekPattern[];
  cryptoName: string;
}

export function SeasonalChart({ monthly, quarterly, dayOfWeek, cryptoName }: SeasonalChartProps) {
  // Prepare data for charts
  const monthlyData = monthly.map(m => ({
    name: m.monthName.slice(0, 3),
    avgReturn: m.data.averageReturn,
    winRate: m.data.winRate,
    count: m.data.totalCount,
  }));

  const quarterlyData = quarterly.map(q => ({
    name: q.quarterName,
    avgReturn: q.data.averageReturn,
    winRate: q.data.winRate,
    count: q.data.totalCount,
  }));

  const dayOfWeekData = dayOfWeek.map(d => ({
    name: d.dayName.slice(0, 3),
    avgReturn: d.data.averageReturn,
    winRate: d.data.winRate,
    count: d.data.totalCount,
  }));

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            Avg Return: <span className={payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}>
              {payload[0].value.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Win Rate: {payload[0].payload.winRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500">
            Sample: {payload[0].payload.count} days
          </p>
        </div>
      );
    }
    return null;
  };

  // Get color based on value
  const getColor = (value: number) => {
    if (value > 0) return '#10b981'; // green
    if (value < 0) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Seasonal Price Patterns</h2>
        <p className="text-sm text-gray-600">
          Historical average returns for {cryptoName} by time period
        </p>
      </div>

      {/* Monthly Patterns */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgReturn" name="Avg Return %" radius={[4, 4, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.avgReturn)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quarterly Patterns */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quarterly Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={quarterlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgReturn" name="Avg Return %" radius={[4, 4, 0, 0]}>
              {quarterlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.avgReturn)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day of Week Patterns */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Day of Week Performance</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dayOfWeekData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgReturn" name="Avg Return %" radius={[4, 4, 0, 0]}>
              {dayOfWeekData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.avgReturn)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Best Month:</p>
            <p className="font-semibold text-green-600">
              {monthly.reduce((best, curr) => 
                curr.data.averageReturn > best.data.averageReturn ? curr : best
              ).monthName}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Best Quarter:</p>
            <p className="font-semibold text-green-600">
              {quarterly.reduce((best, curr) => 
                curr.data.averageReturn > best.data.averageReturn ? curr : best
              ).quarterName}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Best Day:</p>
            <p className="font-semibold text-green-600">
              {dayOfWeek.reduce((best, curr) => 
                curr.data.averageReturn > best.data.averageReturn ? curr : best
              ).dayName}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          ⚠️ Past performance does not guarantee future results. These patterns are based on historical data and should not be used as the sole basis for investment decisions.
        </p>
      </div>
    </div>
  );
}
