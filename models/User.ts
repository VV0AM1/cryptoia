import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { CoinSchema } from './Coin';
import type { ICoin } from '@/types/coin';
import { ITransaction, TransactionSchema } from './Transaction';
import { INote, NoteSchema } from './Note';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  coins: ICoin[];
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
  provider?: string; 
  isVerified: boolean; 
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  watchlist: ICoin[];                   
  transactions: Types.DocumentArray<ITransaction>;
  notes: Types.DocumentArray<INote>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },

  coins: [CoinSchema],
  watchlist: { type: [CoinSchema], default: [] }, 

  transactions: [TransactionSchema],
  notes: [NoteSchema],

  totalInvested: { type: Number, default: 0 },
  totalCurrentValue: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
    provider: { type: String, default: 'credentials' },
  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user','admin'], default: 'user' },
}, { timestamps: true });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);