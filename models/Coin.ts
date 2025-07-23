import mongoose, { Schema, Document, models } from 'mongoose';

const CoinSchema = new mongoose.Schema({
  id: { type: String, required: true },
  symbol: String,
  name: String,
  current_price: Number,
  market_cap: Number,
  sparkline_in_7d: {
    price: [Number],
  },
}, { timestamps: true });

export default mongoose.models.Coin || mongoose.model('Coin', CoinSchema);