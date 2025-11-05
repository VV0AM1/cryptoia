import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerifyToken extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const VerifyTokenSchema = new Schema<IVerifyToken>({
  email: { type: String, required: true },
  name: { type: String },
  passwordHash: { type: String }, 
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export const VerifyToken: Model<IVerifyToken> = mongoose.models.VerifyToken || mongoose.model<IVerifyToken>('VerifyToken', VerifyTokenSchema);
