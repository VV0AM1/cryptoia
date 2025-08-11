const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

async function updateMarketStats() {
  const filePath = path.join(__dirname, '..', 'public', 'marketStats.json');

  try {
    console.log('📡 Fetching market stats...');

    const binanceRes = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const usdtPairs = binanceRes.data.filter((pair) => pair.symbol.endsWith('USDT'));

    const topPairs = usdtPairs
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 20);

    const totalVolume = topPairs.reduce(
      (sum, pair) => sum + parseFloat(pair.quoteVolume),
      0
    );

    const btc = topPairs.find((pair) => pair.symbol === 'BTCUSDT');
    const btcVolume = btc ? parseFloat(btc.quoteVolume) : 0;
    const btcDominance = totalVolume > 0 ? (btcVolume / totalVolume) * 100 : 0;

    const geckoRes = await axios.get('https://api.coingecko.com/api/v3/global');
    const totalMarketCap = geckoRes.data.data.total_market_cap.usd;

    const result = {
      totalMarketCap,
      totalVolume,
      btcDominance,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');

    console.log('✅ Market stats saved to public/marketStats.json');
  } catch (error) {
    console.error('❌ Failed to update stats:', error.message);
  }
}

updateMarketStats();