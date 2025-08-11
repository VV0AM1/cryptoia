const fs = require('fs');
const path = require('path');
const axios = require('axios');

const outputPath = path.join(__dirname, '..', 'data', 'symbolMap.json');
let currentPage = 1;
const maxPages = 10;
let symbolMap = {}; // In-memory cache of symbol map

async function fetchPageAndUpdateMap(page) {
  try {
    console.log(`📦 Fetching CoinGecko page ${page}...`);

    const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 250,
        page,
      },
      headers: {
        'User-Agent': 'MyCoinApp/1.0 (myemail@example.com)',
      },
    });

    data.forEach((coin) => {
      const binanceSymbol = (coin.symbol + 'usdt').toUpperCase();
      symbolMap[binanceSymbol] = {
        id: coin.id,
        name: coin.name,
        image: coin.image,
      };
    });

    fs.writeFileSync(outputPath, JSON.stringify(symbolMap, null, 2));
    console.log(`✅ Page ${page} done. Map has ${Object.keys(symbolMap).length} entries.`);
  } catch (err) {
    console.error(`❌ Error fetching page ${page}:`, err.message);
  }
}

setInterval(async () => {
  await fetchPageAndUpdateMap(currentPage);

  currentPage++;
  if (currentPage > maxPages) {
    currentPage = 1;
    symbolMap = {};
    console.log('🔄 Restarting from page 1 and clearing symbolMap');
  }
}, 30 * 1000);

// Start immediately
fetchPageAndUpdateMap(currentPage);
currentPage++;