'use client';

interface CryptoTrendData {
  symbol: string;
  name: string;
  summary: {
    startPrice: number;
    endPrice: number;
    percentChange: number;
    highPrice: number;
    lowPrice: number;
  };
}

interface StatsCardsProps {
  data: CryptoTrendData[];
}

export function StatsCards({ data }: StatsCardsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate aggregate statistics
  const avgChange = data.reduce((sum, item) => sum + item.summary.percentChange, 0) / data.length;
  const positiveCount = data.filter(item => item.summary.percentChange > 0).length;
  const negativeCount = data.filter(item => item.summary.percentChange < 0).length;
  
  const topGainer = data.reduce((max, item) => 
    item.summary.percentChange > max.summary.percentChange ? item : max
  , data[0]);
  
  const topLoser = data.reduce((min, item) => 
    item.summary.percentChange < min.summary.percentChange ? item : min
  , data[0]);

  const cards = [
    {
      label: 'Average Change',
      value: `${avgChange.toFixed(2)}%`,
      color: avgChange >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: avgChange >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      label: 'Top Gainer',
      value: topGainer.symbol,
      detail: `+${topGainer.summary.percentChange.toFixed(2)}%`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Top Loser',
      value: topLoser.symbol,
      detail: `${topLoser.summary.percentChange.toFixed(2)}%`,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Cryptocurrencies',
      value: data.length.toString(),
      detail: `↑ ${positiveCount} / ↓ ${negativeCount}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg p-6 shadow`}>
          <p className="text-sm font-medium text-gray-600 mb-2">{card.label}</p>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          {card.detail && (
            <p className="text-sm text-gray-600 mt-1">{card.detail}</p>
          )}
        </div>
      ))}
    </div>
  );
}
