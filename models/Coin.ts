import { Schema } from 'mongoose';
import type { ICoin } from '@/types/coin';


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

export type { ICoin }; 