import axios from './axiosCoinGecko';

export const getMarketStats = async () => {
  const res = await axios.get('/global');
  return res.data.data;
};