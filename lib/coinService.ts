import axios from './axiosBinance';

export const getAssets = async () => {
  const { data } = await axios.get('/ticker/24hr');

  return data.slice(0, 50).map((coin: any) => ({
    id: coin.symbol,
    symbol: coin.symbol,
    name: coin.symbol, // You can map this from `symbolMap` if needed
    image: `/icons/${coin.symbol}.png`, // or static/default
    current_price: parseFloat(coin.lastPrice),
    price_change_percentage_24h: parseFloat(coin.priceChangePercent),
  }));
};

export const getAssetHistory = async (
  symbol: string,
  days: string = '7'
) => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const startTime = now - parseInt(days) * oneDay;

  const { data } = await axios.get('/klines', {
    params: {
      symbol: symbol.toUpperCase(), // e.g. BTCUSDT
      interval: '1d',
      startTime,
      endTime: now,
    },
  });

  return data.map(([time, open, high, low, close]: any[]) => ({
    time,
    priceUsd: parseFloat(close),
  }));
};


export const getAssetByName = async (symbol: string) => {
  const { data } = await axios.get(`/ticker/24hr`, {
    params: { symbol },
  });

  return {
    id: symbol,
    symbol: symbol,
    name: symbol, // You could map this from a known list
    image: `/placeholder.png`,
    currentPrice: parseFloat(data.lastPrice),
    priceChangePercentage24h: parseFloat(data.priceChangePercent),
  };
};