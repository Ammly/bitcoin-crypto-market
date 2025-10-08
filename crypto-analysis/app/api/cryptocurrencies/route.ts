import { NextResponse } from 'next/server';
import { getCryptocurrencies, getLatestPrices } from '@/lib/db/queries';

export async function GET() {
  try {
    const cryptos = await getCryptocurrencies();
    const latestPrices = await getLatestPrices();
    
    // Merge the data
    const cryptoData = cryptos.map(crypto => {
      const priceData = latestPrices.find(p => p.cryptoId === crypto.id);
      
      return {
        id: crypto.id,
        symbol: crypto.symbol,
        name: crypto.name,
        latestPrice: priceData ? {
          close: parseFloat(priceData.close),
          date: priceData.date,
          marketCap: priceData.marketCap ? parseFloat(priceData.marketCap) : null,
          volume: parseFloat(priceData.volume),
        } : null,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: cryptoData,
      count: cryptoData.length,
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
