import axios from 'axios';

const axiosBinance = axios.create({
  baseURL: 'https://api.binance.com/api/v3',
});

export default axiosBinance;
