import { NextRequest, NextResponse } from 'next/server';
import { getCryptocurrencyBySymbol, getPriceHistoryMultiple, getPriceHistory } from '@/lib/db/queries';
import { calculateBitcoinDominance, calculateDominanceStats } from '@/lib/calculations/dominance';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '365');
    
    // Get Bitcoin cryptocurrency - trying both BTC and BITCOIN symbols
    let bitcoin = await getCryptocurrencyBySymbol('BTC');
    if (!bitcoin) {
      bitcoin = await getCryptocurrencyBySymbol('BITCOIN');
    }
    
    if (!bitcoin) {
      return NextResponse.json(
        { error: 'Bitcoin data not found' },
        { status: 404 }
      );
    }
    
    // Calculate date range using the latest data date instead of current date
    const bitcoinLatest = await getPriceHistory(bitcoin.id, new Date(0), new Date());
    if (bitcoinLatest.length === 0) {
      return NextResponse.json(
        { error: 'No Bitcoin price data available' },
        { status: 404 }
      );
    }
    const endDate = new Date(bitcoinLatest[bitcoinLatest.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Get all cryptocurrencies' price history for the date range
    const [bitcoinPrices, allPrices] = await Promise.all([
      getPriceHistory(bitcoin.id, startDate, endDate),
      getPriceHistoryMultiple([], startDate, endDate), // Empty array gets all
    ]);
    
    if (bitcoinPrices.length === 0 || allPrices.length === 0) {
      return NextResponse.json(
        { error: 'No price data available for the specified period' },
        { status: 404 }
      );
    }
    
    // Calculate dominance
    const dominanceData = calculateBitcoinDominance(bitcoinPrices, allPrices);
    const stats = calculateDominanceStats(dominanceData);
    
    return NextResponse.json({
      dominance: dominanceData,
      stats,
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    console.error('Error calculating Bitcoin dominance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Bitcoin dominance' },
      { status: 500 }
    );
  }
}
