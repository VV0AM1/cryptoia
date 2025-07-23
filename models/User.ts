import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  watchlist: Types.ObjectId[];
  portfolio: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },

    watchlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Coin',
      },
    ],

    portfolio: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Coin',
      },
    ],
  },
  { timestamps: true }
);

export default models.User || mongoose.model<IUser>('User', UserSchema);