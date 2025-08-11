const axios = require('axios');
const fs = require('fs');

async function fetchAndSave() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page: 1,
      },
    });

    const map = {};
    for (const coin of res.data) {
      map[coin.symbol.toUpperCase() + 'USDT'] = coin.market_cap; // align with Binance symbols
    }

    fs.writeFileSync('data/marketCapMap.json', JSON.stringify(map, null, 2));
    console.log('✅ marketCapMap.json saved successfully!');
  } catch (err) {
    console.error('❌ Failed to fetch/save market cap data:', err.message);
  }
}

fetchAndSave();