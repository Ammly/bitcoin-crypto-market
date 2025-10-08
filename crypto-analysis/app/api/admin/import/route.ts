import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';
import Papa from 'papaparse';
import { upsertCryptocurrency, insertPriceHistory, deletePriceHistory } from '@/lib/db/mutations';
import { getCryptocurrencyBySymbol } from '@/lib/db/queries';

interface CsvRow {
  Date: string;
  Open: string;
  High: string;
  Low: string;
  Close: string;
  Volume: string;
  Marketcap: string;
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'import') {
      // Get the data directory path (one level up from crypto-analysis)
      const dataDir = path.join(process.cwd(), '..', 'data', 'raw');
      
      try {
        const files = await fs.readdir(dataDir);
        const csvFiles = files.filter(f => f.startsWith('coin_') && f.endsWith('.csv'));
        
        const results = [];
        
        for (const file of csvFiles) {
          try {
            // Extract coin name from filename (e.g., coin_Bitcoin.csv -> Bitcoin)
            const coinName = file.replace('coin_', '').replace('.csv', '');
            const symbol = coinName.toUpperCase().substring(0, 10); // Create a symbol
            
            // Read and parse CSV file
            const filePath = path.join(dataDir, file);
            const fileContent = await fs.readFile(filePath, 'utf-8');
            
            const parseResult = Papa.parse<CsvRow>(fileContent, {
              header: true,
              skipEmptyLines: true,
              dynamicTyping: false,
            });
            
            if (parseResult.errors.length > 0) {
              results.push({
                file,
                success: false,
                error: `Parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`,
              });
              continue;
            }
            
            // Upsert cryptocurrency
            const crypto = await upsertCryptocurrency({
              symbol,
              name: coinName,
            });
            
            // Delete existing price history
            await deletePriceHistory(crypto.id);
            
            // Transform and validate data
            const priceData = parseResult.data
              .filter(row => row.Date && row.Close) // Filter out invalid rows
              .map(row => ({
                cryptoId: crypto.id,
                date: new Date(row.Date),
                open: row.Open || row.Close, // Use close if open is missing
                high: row.High || row.Close,
                low: row.Low || row.Close,
                close: row.Close,
                volume: row.Volume || '0',
                marketCap: row.Marketcap || null,
              }))
              .filter(row => !isNaN(row.date.getTime())); // Filter invalid dates
            
            // Insert price history
            await insertPriceHistory(priceData);
            
            results.push({
              file,
              success: true,
              coinName,
              symbol,
              recordsImported: priceData.length,
            });
            
          } catch (fileError: unknown) {
            const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
            results.push({
              file,
              success: false,
              error: errorMessage,
            });
          }
        }
        
        return NextResponse.json({
          success: true,
          message: `Processed ${csvFiles.length} files`,
          results,
        });
        
      } catch (dirError: unknown) {
        const errorMessage = dirError instanceof Error ? dirError.message : 'Unknown error';
        return NextResponse.json(
          {
            success: false,
            error: `Failed to read data directory: ${errorMessage}`,
          },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), '..', 'data', 'raw');
    const files = await fs.readdir(dataDir);
    const csvFiles = files.filter(f => f.startsWith('coin_') && f.endsWith('.csv'));
    
    return NextResponse.json({
      success: true,
      availableFiles: csvFiles,
      count: csvFiles.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
