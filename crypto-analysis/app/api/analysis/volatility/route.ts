import { NextRequest, NextResponse } from 'next/server';
import { getPriceDataWithCrypto, getCryptocurrencies, getLatestPrices } from '@/lib/db/queries';
import { calculateReturns } from '@/lib/calculations/returns';
import { calculateStandardDeviation, calculateAnnualizedVolatility } from '@/lib/calculations/volatility';
import { subDays } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cryptoIdsParam = searchParams.get('cryptoIds');
    const days = parseInt(searchParams.get('days') || '90');
    
    let cryptoIds: number[];
    
    if (cryptoIdsParam) {
      cryptoIds = cryptoIdsParam.split(',').map(id => parseInt(id));
    } else {
      const allCryptos = await getCryptocurrencies();
      cryptoIds = allCryptos.map(c => c.id);
    }
    
    // Get the latest date from the database instead of using current date
    const latestPrices = await getLatestPrices(cryptoIds);
    const endDate = latestPrices.length > 0 
      ? new Date(latestPrices[0].date) 
      : new Date();
    const startDate = subDays(endDate, days);
    
    const priceData = await getPriceDataWithCrypto(cryptoIds, startDate, endDate);
    
    // Group data by cryptocurrency
    interface PricePoint {
      date: Date;
      close: number;
    }
    
    const groupedData: { [key: string]: PricePoint[] } = {};
    const cryptoInfo: { [key: string]: { symbol: string; name: string; cryptoId: number } } = {};
    
    for (const row of priceData) {
      const key = `${row.symbol}_${row.cryptoId}`;
      
      if (!groupedData[key]) {
        groupedData[key] = [];
        cryptoInfo[key] = {
          symbol: row.symbol,
          name: row.name,
          cryptoId: row.cryptoId,
        };
      }
      
      groupedData[key].push({
        date: row.date,
        close: parseFloat(row.close),
      });
    }
    
    // Calculate volatility metrics for each cryptocurrency
    const volatilityAnalysis = Object.keys(groupedData).map(key => {
      const data = groupedData[key].sort((a, b) => a.date.getTime() - b.date.getTime());
      
      if (data.length < 2) return null;
      
      const prices = data.map(d => d.close);
      const returns = calculateReturns(prices);
      
      const dailyVolatility = calculateStandardDeviation(returns);
      const annualizedVol = calculateAnnualizedVolatility(returns);
      
      const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const coefficientOfVariation = dailyVolatility / Math.abs(meanReturn) || 0;
      
      return {
        ...cryptoInfo[key],
        volatility: {
          daily: dailyVolatility,
          annualized: annualizedVol,
          coefficientOfVariation,
        },
        returns: {
          mean: meanReturn,
          standardDeviation: dailyVolatility,
          min: Math.min(...returns),
          max: Math.max(...returns),
        },
        dataPoints: data.length,
      };
    }).filter(item => item !== null);
    
    // Sort by volatility (descending)
    volatilityAnalysis.sort((a, b) => (b?.volatility.annualized || 0) - (a?.volatility.annualized || 0));
    
    return NextResponse.json({
      success: true,
      data: volatilityAnalysis,
      meta: {
        cryptoCount: volatilityAnalysis.length,
        startDate,
        endDate,
        days,
      },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
