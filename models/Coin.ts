import { Schema, Types } from 'mongoose';

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

export const CoinSchema = new Schema<ICoin>(
  {
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },

    currentPrice: { type: Number, required: true },
    priceChangePercentage24h: { type: Number, required: true },

    totalInvested: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } 
);