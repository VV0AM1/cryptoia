import axios from 'axios';

let cachedMarketCapMap: Record<string, number> | null = null;
let lastFetched = 0;
const CACHE_TTL = 30 * 1000; 
export async function getMarketCapMap() {
  const now = Date.now();
  if (cachedMarketCapMap && now - lastFetched < CACHE_TTL) {
    return cachedMarketCapMap;
  }

  const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 250,
      page: 1,
    },
  });

  const map: Record<string, number> = {};
  for (const coin of res.data) {
    map[coin.symbol.toUpperCase() + 'USDT'] = coin.market_cap;
  }

  cachedMarketCapMap = map;
  lastFetched = now;

  return map;
}