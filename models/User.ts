import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { ICoin, CoinSchema } from './Coin';
import { ITransaction, TransactionSchema } from './Transaction';
import { INote, NoteSchema } from './Note'; // Make sure both are exported

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: { type: String }
  coins: ICoin[];
  totalInvested: number;
  totalCurrentValue: number;
  totalProfit: number;
  watchlist: ICoin[];
  transactions: Types.DocumentArray<ITransaction>;
  notes: Types.DocumentArray<INote>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  watchlist: { type: [CoinSchema], default: [] },
  avatar: { type: String },
  coins: [CoinSchema], // ✅ No need for "type: ..."
  transactions: [TransactionSchema], // ✅ Embedded subdocuments
  notes: [NoteSchema], // ✅ Fix applied here

  totalInvested: { type: Number, default: 0 },
  totalCurrentValue: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
