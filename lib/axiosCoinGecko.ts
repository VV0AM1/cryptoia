import axios from 'axios';

const axiosGecko = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3',
});

export default axiosGecko;