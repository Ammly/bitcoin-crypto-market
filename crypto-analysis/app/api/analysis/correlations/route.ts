import { NextRequest, NextResponse } from 'next/server';
import { getPriceDataWithCrypto, getCryptocurrencies, getLatestPrices } from '@/lib/db/queries';
import { calculateReturns } from '@/lib/calculations/returns';
import { calculateCorrelationMatrix, findStrongestCorrelations } from '@/lib/calculations/correlations';
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
      cryptoIds = allCryptos.slice(0, 15).map(c => c.id); // Limit to 15 for correlation matrix
    }
    
    // Get the latest date from the database instead of using current date
    const latestPrices = await getLatestPrices(cryptoIds);
    const endDate = latestPrices.length > 0 
      ? new Date(latestPrices[0].date) 
      : new Date();
    const startDate = subDays(endDate, days);
    
    const priceData = await getPriceDataWithCrypto(cryptoIds, startDate, endDate);
    
    // Group data by cryptocurrency and align by date
    const dateMap: { [date: string]: { [cryptoId: number]: number } } = {};
    const cryptoInfo: { [cryptoId: number]: { symbol: string; name: string } } = {};
    
    for (const row of priceData) {
      const dateStr = row.date.toISOString().split('T')[0];
      
      if (!dateMap[dateStr]) {
        dateMap[dateStr] = {};
      }
      
      dateMap[dateStr][row.cryptoId] = parseFloat(row.close);
      
      if (!cryptoInfo[row.cryptoId]) {
        cryptoInfo[row.cryptoId] = {
          symbol: row.symbol,
          name: row.name,
        };
      }
    }
    
    // Get sorted dates
    const dates = Object.keys(dateMap).sort();
    
    // Build aligned price series for each crypto
    const priceSeriesMap: { [key: string]: number[] } = {};
    
    for (const cryptoId of cryptoIds) {
      const prices: number[] = [];
      
      for (const date of dates) {
        if (dateMap[date][cryptoId] !== undefined) {
          prices.push(dateMap[date][cryptoId]);
        }
      }
      
      if (prices.length > 1) {
        const returns = calculateReturns(prices);
        priceSeriesMap[cryptoId.toString()] = returns;
      }
    }
    
    // Calculate correlation matrix
    const correlationMatrix = calculateCorrelationMatrix(priceSeriesMap);
    
    // Find strongest correlations
    const strongestCorrelations = findStrongestCorrelations(correlationMatrix, 20);
    
    // Format matrix for frontend
    const formattedMatrix = Object.keys(correlationMatrix).map(cryptoId1 => {
      const id1 = parseInt(cryptoId1);
      const row: Record<string, number> = {
        cryptoId: id1,
        symbol: cryptoInfo[id1]?.symbol || '',
        name: cryptoInfo[id1]?.name || '',
      };
      
      Object.keys(correlationMatrix[cryptoId1]).forEach(cryptoId2 => {
        row[`crypto_${cryptoId2}`] = correlationMatrix[cryptoId1][cryptoId2];
      });
      
      return row;
    });
    
    // Format strongest correlations with names
    const formattedStrongest = strongestCorrelations.map(item => ({
      crypto1: {
        id: parseInt(item.pair[0]),
        symbol: cryptoInfo[parseInt(item.pair[0])]?.symbol,
        name: cryptoInfo[parseInt(item.pair[0])]?.name,
      },
      crypto2: {
        id: parseInt(item.pair[1]),
        symbol: cryptoInfo[parseInt(item.pair[1])]?.symbol,
        name: cryptoInfo[parseInt(item.pair[1])]?.name,
      },
      correlation: item.correlation,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        matrix: formattedMatrix,
        strongestCorrelations: formattedStrongest,
        cryptoInfo,
      },
      meta: {
        cryptoCount: Object.keys(priceSeriesMap).length,
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
