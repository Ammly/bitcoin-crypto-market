'use client';

interface CryptoComparison {
  id: number;
  name: string;
  symbol: string;
  currentPrice: number;
  change24h: number;
  volume: number;
  marketCap?: number;
  volatility?: number;
}

interface ComparisonTableProps {
  data: CryptoComparison[];
}

export default function ComparisonTable({ data }: ComparisonTableProps) {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 bg-green-50';
    if (change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getVolatilityBadge = (volatility?: number) => {
    if (!volatility) return null;
    if (volatility > 5) return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">High</span>;
    if (volatility > 2) return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Medium</span>;
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Low</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Cryptocurrency Comparison
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              {data.some(d => d.marketCap) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Cap
                </th>
              )}
              {data.some(d => d.volatility !== undefined) && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volatility
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((crypto, index) => (
              <tr key={crypto.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {crypto.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {crypto.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  ${crypto.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChangeColor(crypto.change24h)}`}>
                    {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${crypto.volume.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </td>
                {data.some(d => d.marketCap) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {crypto.marketCap
                      ? `$${crypto.marketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                      : '-'}
                  </td>
                )}
                {data.some(d => d.volatility !== undefined) && (
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getVolatilityBadge(crypto.volatility)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No cryptocurrencies to compare
        </div>
      )}
    </div>
  );
}
