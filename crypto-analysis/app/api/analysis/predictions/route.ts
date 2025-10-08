import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory, getCryptocurrencyById } from '@/lib/db/queries';
import { predictWithEnsemble } from '@/lib/calculations/predictions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cryptoIdParam = searchParams.get('cryptoId');
    const days = parseInt(searchParams.get('days') || '365'); // Use 1 year of data for predictions
    
    if (!cryptoIdParam) {
      return NextResponse.json(
        { error: 'cryptoId parameter is required' },
        { status: 400 }
      );
    }
    
    const cryptoId = parseInt(cryptoIdParam);
    
    // Get cryptocurrency info
    const crypto = await getCryptocurrencyById(cryptoId);
    
    if (!crypto) {
      return NextResponse.json(
        { error: 'Cryptocurrency not found' },
        { status: 404 }
      );
    }
    
    // Calculate date range using the latest data date instead of current date
    const allPrices = await getPriceHistory(cryptoId, new Date(0), new Date());
    if (allPrices.length === 0) {
      return NextResponse.json(
        { error: 'No price data available' },
        { status: 404 }
      );
    }
    const endDate = new Date(allPrices[allPrices.length - 1].date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Get price history
    const prices = await getPriceHistory(cryptoId, startDate, endDate);
    
    if (prices.length < 200) {
      return NextResponse.json(
        { error: 'Insufficient historical data for predictions (need at least 200 days)' },
        { status: 400 }
      );
    }
    
    // Generate predictions
    const predictionResult = predictWithEnsemble(prices);
    
    // Add disclaimer
    const disclaimer = 'These predictions are based on historical data and technical analysis. They should not be considered as financial advice. Cryptocurrency markets are highly volatile and unpredictable. Always do your own research and consult with financial advisors before making investment decisions.';
    
    return NextResponse.json({
      cryptocurrency: {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
      },
      period: {
        days,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      prediction: predictionResult,
      disclaimer,
    });
  } catch (error) {
    console.error('Error generating predictions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}
