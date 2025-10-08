import { NextRequest, NextResponse } from 'next/server';
import { getPriceDataWithCrypto, getCryptocurrencies, getLatestPrices } from '@/lib/db/queries';
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
      // Get all cryptocurrencies if none specified
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
    const groupedData: { [key: string]: any[] } = {};
    
    for (const row of priceData) {
      const key = `${row.symbol}_${row.cryptoId}`;
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      
      groupedData[key].push({
        date: row.date,
        open: parseFloat(row.open),
        high: parseFloat(row.high),
        low: parseFloat(row.low),
        close: parseFloat(row.close),
        volume: parseFloat(row.volume),
        marketCap: row.marketCap ? parseFloat(row.marketCap) : null,
      });
    }
    
    // Calculate trend metrics for each cryptocurrency
    const trends = Object.keys(groupedData).map(key => {
      const data = groupedData[key];
      const [symbol, cryptoIdStr] = key.split('_');
      
      if (data.length === 0) return null;
      
      const sortedData = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstClose = sortedData[0].close;
      const lastClose = sortedData[sortedData.length - 1].close;
      const percentChange = ((lastClose - firstClose) / firstClose) * 100;
      
      const prices = sortedData.map(d => d.close);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      return {
        cryptoId: parseInt(cryptoIdStr),
        symbol,
        name: priceData.find(p => p.cryptoId === parseInt(cryptoIdStr))?.name,
        data: sortedData,
        summary: {
          startDate: sortedData[0].date,
          endDate: sortedData[sortedData.length - 1].date,
          startPrice: firstClose,
          endPrice: lastClose,
          percentChange,
          highPrice: maxPrice,
          lowPrice: minPrice,
          dataPoints: sortedData.length,
        },
      };
    }).filter(item => item !== null);
    
    return NextResponse.json({
      success: true,
      data: trends,
      meta: {
        cryptoCount: trends.length,
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
