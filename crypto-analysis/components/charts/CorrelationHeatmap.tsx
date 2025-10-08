'use client';

import React from 'react';

interface CorrelationData {
  matrix: Array<Record<string, number | string>>;
  strongestCorrelations: Array<{
    crypto1: { symbol: string; name: string };
    crypto2: { symbol: string; name: string };
    correlation: number;
  }>;
  cryptoInfo: Record<number, { symbol: string; name: string }>;
}

interface CorrelationHeatmapProps {
  data: CorrelationData | null;
}

export function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
  if (!data || !data.matrix || data.matrix.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center px-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
          </svg>
          <p className="text-gray-700 font-medium mb-1">No Data Available</p>
          <p className="text-sm text-gray-600">Correlation data will appear here once loaded</p>
        </div>
      </div>
    );
  }

  const { matrix, strongestCorrelations } = data;

  // Get correlation color and text color
  const getColor = (value: number): string => {
    if (value > 0.7) return 'bg-green-600 text-white';
    if (value > 0.4) return 'bg-green-400 text-white';
    if (value > 0.1) return 'bg-green-200 text-gray-900';
    if (value > -0.1) return 'bg-gray-200 text-gray-900';
    if (value > -0.4) return 'bg-red-200 text-gray-900';
    if (value > -0.7) return 'bg-red-400 text-white';
    return 'bg-red-600 text-white';
  };

  const symbols = matrix.map(row => row.symbol as string);

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `100px repeat(${symbols.length}, 60px)` }}>
            {/* Header row */}
            <div></div>
            {symbols.map(symbol => (
              <div key={symbol} className="text-xs font-semibold text-gray-700 text-center py-2">
                {symbol}
              </div>
            ))}
            
            {/* Data rows */}
            {matrix.map((row, i) => (
              <React.Fragment key={`row-${i}`}>
                <div className="text-xs font-semibold text-gray-700 py-2 pr-2 text-right">
                  {row.symbol}
                </div>
                {symbols.map((symbol, j) => {
                  const value = row[`crypto_${matrix[j].cryptoId}`] as number;
                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`${getColor(value)} flex items-center justify-center text-xs font-medium h-14 rounded`}
                      title={`${row.symbol} vs ${symbol}: ${value.toFixed(3)}`}
                    >
                      {value.toFixed(2)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
        <span className="font-semibold text-gray-900">Correlation:</span>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-red-600 rounded shadow-sm"></div>
          <span className="text-gray-700 font-medium">Strong Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded shadow-sm border border-gray-300"></div>
          <span className="text-gray-700 font-medium">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-green-600 rounded shadow-sm"></div>
          <span className="text-gray-700 font-medium">Strong Positive</span>
        </div>
      </div>

      {/* Strongest Correlations */}
      {strongestCorrelations && strongestCorrelations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Strongest Correlations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {strongestCorrelations.slice(0, 10).map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">{item.crypto1.symbol}</span>
                  <span className="text-gray-400 mx-2">↔</span>
                  <span className="font-semibold text-gray-900">{item.crypto2.symbol}</span>
                </div>
                <div className={`font-bold text-lg ${item.correlation > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.correlation.toFixed(3)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
