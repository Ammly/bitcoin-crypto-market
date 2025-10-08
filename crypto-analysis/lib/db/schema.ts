import { pgTable, serial, varchar, timestamp, integer, numeric, text, index } from 'drizzle-orm/pg-core';

// Cryptocurrencies table
export const cryptocurrencies = pgTable('cryptocurrencies', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Price history table with proper indexing for performance
export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  cryptoId: integer('crypto_id').references(() => cryptocurrencies.id).notNull(),
  date: timestamp('date').notNull(),
  open: numeric('open', { precision: 20, scale: 8 }).notNull(),
  high: numeric('high', { precision: 20, scale: 8 }).notNull(),
  low: numeric('low', { precision: 20, scale: 8 }).notNull(),
  close: numeric('close', { precision: 20, scale: 8 }).notNull(),
  volume: numeric('volume', { precision: 30, scale: 8 }).notNull(),
  marketCap: numeric('market_cap', { precision: 30, scale: 2 }),
}, (table) => ({
  cryptoDateIdx: index('idx_crypto_date').on(table.cryptoId, table.date),
  dateIdx: index('idx_date').on(table.date),
}));

// Analysis cache table for storing computed results
export const analysisCache = pgTable('analysis_cache', {
  id: serial('id').primaryKey(),
  analysisType: varchar('analysis_type', { length: 50 }).notNull(),
  cryptoIds: text('crypto_ids').notNull(), // JSON array of crypto IDs
  dateRange: text('date_range').notNull(), // JSON object with start and end dates
  results: text('results').notNull(), // JSON with analysis results
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  analysisTypeIdx: index('idx_analysis_type').on(table.analysisType),
}));

// Type exports for TypeScript
export type Cryptocurrency = typeof cryptocurrencies.$inferSelect;
export type NewCryptocurrency = typeof cryptocurrencies.$inferInsert;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type NewPriceHistory = typeof priceHistory.$inferInsert;
export type AnalysisCache = typeof analysisCache.$inferSelect;
export type NewAnalysisCache = typeof analysisCache.$inferInsert;
