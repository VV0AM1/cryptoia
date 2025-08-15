export interface ICoin {
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  totalInvested: number;
  averagePrice: number;
  quantity: number;
  createdAt?: Date;
}