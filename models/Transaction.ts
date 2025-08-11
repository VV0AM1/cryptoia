import { Schema, model, models, Types } from 'mongoose';

export interface ITransaction {
  type: 'buy' | 'sell';
  symbol: string;
  coinId: string;
  price: number;
  quantity: number;
  total: number;
  createdAt: Date;
}

export const TransactionSchema = new Schema<ITransaction>({
  type: { type: String, enum: ['buy', 'sell'], required: true },
  symbol: { type: String, required: true },
  coinId: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Transaction = models.Transaction || model<ITransaction>('Transaction', TransactionSchema);