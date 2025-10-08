import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory, getCryptocurrencyById } from '@/lib/db/queries';
import { 
  analyzeMonthlyPatterns, 
  analyzeQuarterlyPatterns, 
  analyzeDayOfWeekPatterns,
  findBestWorstPeriods 
} from '@/lib/calculations/patterns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cryptoIdParam = searchParams.get('cryptoId');
    const days = parseInt(searchParams.get('days') || '730'); // Default to 2 years for better seasonal analysis
    
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
    
    if (prices.length === 0) {
      return NextResponse.json(
        { error: 'No price data available for the specified period' },
        { status: 404 }
      );
    }
    
    // Analyze patterns
    const monthlyPatterns = analyzeMonthlyPatterns(prices);
    const quarterlyPatterns = analyzeQuarterlyPatterns(prices);
    const dayOfWeekPatterns = analyzeDayOfWeekPatterns(prices);
    
    // Find best/worst periods
    const monthlyBestWorst = findBestWorstPeriods(monthlyPatterns);
    const quarterlyBestWorst = findBestWorstPeriods(quarterlyPatterns);
    const dayOfWeekBestWorst = findBestWorstPeriods(dayOfWeekPatterns);
    
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
      patterns: {
        monthly: monthlyPatterns,
        quarterly: quarterlyPatterns,
        dayOfWeek: dayOfWeekPatterns,
      },
      insights: {
        bestMonth: monthlyBestWorst.best,
        worstMonth: monthlyBestWorst.worst,
        bestQuarter: quarterlyBestWorst.best,
        worstQuarter: quarterlyBestWorst.worst,
        bestDayOfWeek: dayOfWeekBestWorst.best,
        worstDayOfWeek: dayOfWeekBestWorst.worst,
      },
    });
  } catch (error) {
    console.error('Error analyzing seasonal patterns:', error);
    return NextResponse.json(
      { error: 'Failed to analyze seasonal patterns' },
      { status: 500 }
    );
  }
}
