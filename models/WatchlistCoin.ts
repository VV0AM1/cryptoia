import { Schema } from 'mongoose';

export interface IWatchlistCoin {
  coinId: string;
  symbol: string;
  name: string;
  image: string;
}

export const WatchlistCoinSchema = new Schema<IWatchlistCoin>(
  {
    coinId: { type: String, required: true },
    symbol: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);