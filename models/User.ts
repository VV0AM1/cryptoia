import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICoin, CoinSchema } from './Coin';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;

  coins: ICoin[];
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, 

  coins: { type: [CoinSchema], default: [] },

  totalInvested: { type: Number, default: 0 },
  totalCurrentValue: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);