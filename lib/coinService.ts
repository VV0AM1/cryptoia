import axios from './axiosCoinGecko'

export const getAssets = async () => {
  const res = await axios.get('/coins/markets', {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 10,
      page: 1,
      sparkline: true,
    },
  });
  return res.data;
};

export const getAssetByName = async (id: string) => {
  const res = await axios.get(`/coins/${id}`);
  return res.data;
};

export const getAssetHistory = async (id: string, days: string = '7') => {
  const res = await axios.get(`/coins/${id}/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: days,
      interval: 'daily',
    },
  });
  return res.data.prices.map(([time, price]: [number, number]) => ({ time, priceUsd: price }));
};