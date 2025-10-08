'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PriceChart } from '@/components/charts/PriceChart';
import { VolatilityChart } from '@/components/charts/VolatilityChart';
import { CorrelationHeatmap } from '@/components/charts/CorrelationHeatmap';
import { DominanceChart } from '@/components/charts/DominanceChart';
import { SeasonalChart } from '@/components/charts/SeasonalChart';
import { PredictionChart } from '@/components/charts/PredictionChart';
import VolumeChart from '@/components/charts/VolumeChart';
import PriceTable from '@/components/tables/PriceTable';
import ComparisonTable from '@/components/tables/ComparisonTable';
import { CryptoSelector } from '@/components/CryptoSelector';
import { StatsCards } from '@/components/StatsCards';
import MainLayout from '@/components/layout/MainLayout';
import DateRangePicker from '@/components/DateRangePicker';
import { ChartLoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorMessage } from '@/components/ErrorBoundary';

export default function Dashboard() {
  const [selectedCryptos, setSelectedCryptos] = useState<number[]>([]);
  const [days, setDays] = useState(90);
  const [selectedCryptoForSeasonal, setSelectedCryptoForSeasonal] = useState<number | null>(null);
  const [selectedCryptoForPrediction, setSelectedCryptoForPrediction] = useState<number | null>(null);

  // Fetch available cryptocurrencies
  const { data: cryptoList } = useQuery({
    queryKey: ['cryptocurrencies'],
    queryFn: async () => {
      const res = await fetch('/api/cryptocurrencies');
      if (!res.ok) throw new Error('Failed to fetch cryptocurrencies');
      const json = await res.json();
      return json.data;
    },
  });

  // Fetch trends data
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', selectedCryptos, days],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(selectedCryptos.length > 0 && { cryptoIds: selectedCryptos.join(',') }),
      });
      const res = await fetch(`/api/analysis/trends?${params}`);
      if (!res.ok) throw new Error('Failed to fetch trends');
      return res.json();
    },
    enabled: cryptoList && cryptoList.length > 0,
  });

  // Fetch volatility data
  const { data: volatilityData, isLoading: volatilityLoading } = useQuery({
    queryKey: ['volatility', selectedCryptos, days],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(selectedCryptos.length > 0 && { cryptoIds: selectedCryptos.join(',') }),
      });
      const res = await fetch(`/api/analysis/volatility?${params}`);
      if (!res.ok) throw new Error('Failed to fetch volatility');
      return res.json();
    },
    enabled: cryptoList && cryptoList.length > 0,
  });

  // Fetch correlation data
  const { data: correlationData, isLoading: correlationLoading } = useQuery({
    queryKey: ['correlations', selectedCryptos, days],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: days.toString(),
        ...(selectedCryptos.length > 0 && { cryptoIds: selectedCryptos.join(',') }),
      });
      const res = await fetch(`/api/analysis/correlations?${params}`);
      if (!res.ok) throw new Error('Failed to fetch correlations');
      return res.json();
    },
    enabled: cryptoList && cryptoList.length > 0,
  });

  // Fetch Bitcoin dominance data
  const { data: dominanceData, isLoading: dominanceLoading } = useQuery({
    queryKey: ['dominance', days],
    queryFn: async () => {
      const params = new URLSearchParams({
        days: days.toString(),
      });
      const res = await fetch(`/api/analysis/dominance?${params}`);
      if (!res.ok) throw new Error('Failed to fetch dominance');
      return res.json();
    },
    enabled: cryptoList && cryptoList.length > 0,
  });

  // Fetch seasonal patterns data
  const { data: seasonalData, isLoading: seasonalLoading } = useQuery({
    queryKey: ['seasonal', selectedCryptoForSeasonal, days],
    queryFn: async () => {
      const params = new URLSearchParams({
        cryptoId: selectedCryptoForSeasonal!.toString(),
        days: days.toString(),
      });
      const res = await fetch(`/api/analysis/seasonal?${params}`);
      if (!res.ok) throw new Error('Failed to fetch seasonal patterns');
      return res.json();
    },
    enabled: selectedCryptoForSeasonal !== null,
  });

  // Fetch predictions data
  const { data: predictionsData, isLoading: predictionsLoading, error: predictionsError, isError: predictionsIsError } = useQuery({
    queryKey: ['predictions', selectedCryptoForPrediction],
    queryFn: async () => {
      // Use 200 days for predictions (minimum required for accurate predictions)
      const params = new URLSearchParams({
        cryptoId: selectedCryptoForPrediction!.toString(),
        days: '200',
      });
      const res = await fetch(`/api/analysis/predictions?${params}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Predictions API error:', errorText);
        // Parse error message to make it more user-friendly
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Failed to fetch predictions: ${res.status} ${res.statusText}`);
        } catch {
          throw new Error(`Failed to fetch predictions: ${res.status} ${res.statusText}`);
        }
      }
      const data = await res.json();
      console.log('Predictions data received:', data);
      return data;
    },
    enabled: selectedCryptoForPrediction !== null,
    retry: 1,
  });

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Crypto Market Analysis
        </h1>
        <p className="mt-2 text-base text-gray-700">
          Comprehensive analysis of cryptocurrency market trends and patterns
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Cryptocurrencies
            </label>
            <CryptoSelector
              cryptoList={cryptoList || []}
              selectedCryptos={selectedCryptos}
              onChange={setSelectedCryptos}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Time Period
            </label>
            <DateRangePicker
              defaultDays={days}
              onDateRangeChange={setDays}
            />
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        {trendsData && <StatsCards data={trendsData.data} />}

        {/* Charts Grid */}
        <div className="space-y-6">
          {/* Price Trends Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Price Trends
            </h2>
            {trendsLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Loading price trends...</p>
                </div>
              </div>
            ) : (
              <PriceChart data={trendsData?.data || []} />
            )}
          </div>

          {/* Volatility Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Volatility Analysis
            </h2>
            {volatilityLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Loading volatility data...</p>
                </div>
              </div>
            ) : (
              <VolatilityChart data={volatilityData?.data || []} />
            )}
          </div>

          {/* Correlation Heatmap */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Correlation Matrix
            </h2>
            {correlationLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Loading correlation data...</p>
                </div>
              </div>
            ) : (
              <CorrelationHeatmap data={correlationData?.data || null} />
            )}
          </div>

          {/* Bitcoin Dominance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Bitcoin Market Dominance
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              How big is Bitcoin compared to the rest of the cryptocurrency market?
            </p>
            {dominanceLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Loading dominance data...</p>
                </div>
              </div>
            ) : dominanceData ? (
              <DominanceChart
                data={dominanceData.dominance}
                stats={dominanceData.stats}
              />
            ) : null}
          </div>

          {/* Seasonal Patterns */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Seasonal Price Patterns
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Discover seasonal trends and recurring patterns in cryptocurrency prices
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Cryptocurrency
              </label>
              <select
                value={selectedCryptoForSeasonal || ''}
                onChange={(e) => setSelectedCryptoForSeasonal(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium"
              >
                <option value="">Select a cryptocurrency...</option>
                {cryptoList?.map((crypto: { id: number; symbol: string; name: string }) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>
            </div>
            {seasonalLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Analyzing seasonal patterns...</p>
                </div>
              </div>
            ) : seasonalData ? (
              <SeasonalChart
                monthly={seasonalData.patterns.monthly}
                quarterly={seasonalData.patterns.quarterly}
                dayOfWeek={seasonalData.patterns.dayOfWeek}
                cryptoName={cryptoList?.find((c: { id: number }) => c.id === selectedCryptoForSeasonal)?.name || ''}
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center px-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-700 font-medium mb-1">No Data Selected</p>
                  <p className="text-sm text-gray-600">Select a cryptocurrency from the dropdown above to view seasonal patterns</p>
                </div>
              </div>
            )}
          </div>

          {/* Price Predictions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Price Predictions (30 Days)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              AI-powered price predictions using moving averages and linear regression
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Cryptocurrency
              </label>
              <select
                value={selectedCryptoForPrediction || ''}
                onChange={(e) => setSelectedCryptoForPrediction(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 font-medium"
              >
                <option value="">Select a cryptocurrency...</option>
                {cryptoList?.map((crypto: { id: number; symbol: string; name: string }) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))}
              </select>
            </div>
            {predictionsLoading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                  <p className="text-gray-700 font-medium">Generating predictions...</p>
                </div>
              </div>
            ) : predictionsIsError ? (
              <div className="h-96 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Generate Predictions</h3>
                  <p className="text-sm text-gray-600 mb-4">{predictionsError?.message || 'Unknown error occurred'}</p>
                  <p className="text-xs text-gray-500">
                    Predictions require at least 200 days of historical price data. 
                    Please try a different cryptocurrency or ensure your database has sufficient historical data.
                  </p>
                </div>
              </div>
            ) : predictionsData ? (
              <PredictionChart
                prediction={predictionsData.prediction}
                cryptoSymbol={predictionsData.cryptocurrency.symbol}
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center px-6">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-gray-700 font-medium mb-1">No Data Selected</p>
                  <p className="text-sm text-gray-600">Select a cryptocurrency from the dropdown above to view AI-powered price predictions</p>
                </div>
              </div>
            )}
          </div>
        </div>
    </MainLayout>
  );
}
