# Quick Testing Guide

## Prerequisites
Make sure your development server is running:
```bash
npm run dev
```

The app should be accessible at: http://localhost:3000

---

## Step 1: Import Data (REQUIRED)

1. Navigate to: **http://localhost:3000/admin**
2. You should see the CSV Import page
3. Import all 23 CSV files from `data/raw/` directory:
   - `coin_Bitcoin.csv`
   - `coin_Ethereum.csv`
   - `coin_BinanceCoin.csv`
   - `coin_Cardano.csv`
   - ... (and 19 more files)
4. Wait for each import to complete before starting the next
5. You should see success messages for each import

**Note:** Without data import, the dashboard will show no data!

---

## Step 2: Verify Dashboard

Navigate to: **http://localhost:3000/dashboard**

You should see:
- Header: "Crypto Market Analysis"
- Controls section with:
  - Cryptocurrency selector (multi-select)
  - Time period dropdown
- Multiple chart sections below

---

## Step 3: Test Each Feature

### ✅ Test 1: Historical Prices (Q1)
**Location:** "Price Trends" section

1. Select cryptocurrencies (e.g., Bitcoin, Ethereum)
2. Try different time periods (30d, 90d, 180d, 1y, 2y)
3. **Expected:** Line chart showing price history for selected cryptos
4. **Verify:** 
   - Multiple colored lines (one per crypto)
   - Dates on X-axis
   - Prices on Y-axis
   - Tooltips on hover

---

### ✅ Test 2: Bitcoin Dominance (Q2)
**Location:** "Bitcoin Market Dominance" section

1. Scroll down to this section (no selection needed)
2. **Expected:** 
   - Stacked area chart (Bitcoin vs Altcoins)
   - Line chart showing dominance percentage
   - 4 stats cards: Current, Average, Peak, Trend
   - Insights section
3. **Verify:**
   - Dominance percentage is between 0-100%
   - Trend shows emoji (📈/📉/➡️)
   - Charts load without errors

---

### ✅ Test 3: Volatility Analysis (Q4)
**Location:** "Volatility Analysis" section

1. Select multiple cryptocurrencies
2. **Expected:** Volatility comparison chart
3. **Verify:**
   - Shows volatility metrics for each selected crypto
   - Higher values = more volatile
   - Chart updates when changing selection

---

### ✅ Test 4: Correlation Matrix (Q5)
**Location:** "Correlation Matrix" section

1. Select at least 2 cryptocurrencies
2. **Expected:** Heatmap with correlation values
3. **Verify:**
   - Values range from -1 to 1
   - Diagonal is always 1.0 (self-correlation)
   - Colors indicate correlation strength

---

### ✅ Test 5: Seasonal Patterns (Q6)
**Location:** "Seasonal Price Patterns" section

1. **Select a single cryptocurrency** from the dropdown
2. Wait for data to load
3. **Expected:**
   - 3 bar charts:
     - Monthly Patterns (12 bars: Jan-Dec)
     - Quarterly Patterns (4 bars: Q1-Q4)
     - Day of Week Patterns (7 bars: Sun-Sat)
   - Insights showing best month/quarter/day
4. **Verify:**
   - Bars are colored (green = positive, red = negative)
   - Tooltips show average return, win rate, sample size
   - Insights section displays correctly

---

### ✅ Test 6: Price Predictions (Q3)
**Location:** "Price Predictions (30 Days)" section

1. **Select a single cryptocurrency** from the dropdown
2. Wait for predictions to generate
3. **Expected:**
   - 3 stats cards: Current Price, 30-Day Prediction, Trend
   - Line chart showing predicted prices
   - Trading signals section (if any detected)
   - Confidence level legend
   - Key insights
   - Yellow disclaimer box
4. **Verify:**
   - Predicted price shows in 30 days
   - Percentage change displayed
   - Trend indicator (📈 Bullish / 📉 Bearish / ➡️ Neutral)
   - Chart shows predictions for 30 days
   - Signals appear if golden/death cross detected

---

## Step 4: Test Responsiveness

1. Try different screen sizes
2. Use browser dev tools to test mobile view
3. **Verify:** All charts scale appropriately

---

## Step 5: Test Error Handling

### Test with No Selection
1. Clear all cryptocurrency selections
2. **Expected:** Charts should show "No data" or loading state

### Test with Single Crypto
1. Select only one cryptocurrency
2. **Expected:** 
   - Trends, Volatility, Predictions work
   - Correlations may show message (need 2+ cryptos)

---

## ✅ Success Criteria

All 6 questions should be answerable:

| #   | Question                          | Can Answer?                 |
| --- | --------------------------------- | --------------------------- |
| 1   | How did historical prices change? | ✅ Yes - Price Trends chart  |
| 2   | How big is Bitcoin vs others?     | ✅ Yes - Dominance chart     |
| 3   | What will future prices be?       | ✅ Yes - Predictions chart   |
| 4   | Which cryptos are volatile?       | ✅ Yes - Volatility chart    |
| 5   | How do prices correlate?          | ✅ Yes - Correlation heatmap |
| 6   | Are there seasonal patterns?      | ✅ Yes - Seasonal charts     |

---

## 🐛 Troubleshooting

### Charts Not Loading
- Check browser console for errors
- Verify data import was successful
- Make sure PostgreSQL is running: `docker ps`
- Restart dev server: `npm run dev`

### "Insufficient data" errors for Predictions
- Predictions require 200+ days of historical data
- Make sure you imported CSV files with enough history

### Seasonal patterns show "insufficient data"
- Seasonal analysis requires 730 days (2 years) by default
- Try a cryptocurrency with longer history (Bitcoin, Ethereum)

### API 500 errors
- Check terminal for server errors
- Verify database connection in `.env.local`
- Check database has data: `docker exec -it crypto_postgres psql -U crypto_user -d crypto_db -c "SELECT COUNT(*) FROM price_history;"`

---

## 📝 Notes

- **Time periods:** All charts respect the time period selector (30d/90d/180d/1y/2y)
- **Performance:** First load may be slow while React Query caches data
- **Caching:** Subsequent loads should be much faster due to caching
- **Real-time:** This version uses historical data only (no live price feeds)

---

## 🎉 You're Done!

If all tests pass, congratulations! Your cryptocurrency analysis platform is fully functional and ready to answer all 6 key analysis questions from a single dashboard interface.

**Enjoy exploring the crypto market! 🚀📈**
