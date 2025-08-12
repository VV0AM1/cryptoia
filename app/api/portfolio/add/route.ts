import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import rawSymbolMap from '@/data/symbolMap.json';
import axios from 'axios';

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { symbol, amount, price, total, coinId, type = 'buy', timestamp } = body;

    if (!symbol || !amount || !price || !total || !coinId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: token.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const symbolMap = rawSymbolMap as Record<string, { name: string; image: string; id?: string }>;

    // Try match by CoinGecko ID
    let metadataEntry = Object.entries(symbolMap).find(([, meta]) => meta.id === coinId);

    // If not found, try match by the pair key directly (BTCUSDT, SOLUSDT, etc.)
    if (!metadataEntry && symbolMap[coinId]) {
      metadataEntry = [coinId, symbolMap[coinId]];
    }

    if (!metadataEntry) {
      return NextResponse.json({ error: 'Unsupported asset' }, { status: 400 });
    }

    const [validatedSymbol, metadata] = metadataEntry;

    const { data: priceData } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: metadata.id,
        vs_currencies: 'usd',
        include_24hr_change: 'true',
      },
    });

    if (!metadata.id) {
      return NextResponse.json({ error: 'Missing CoinGecko ID in metadata' }, { status: 400 });
    }

    const currentPrice = priceData[metadata.id]?.usd ?? 0;
    const priceChangePercentage24h = priceData[metadata.id]?.usd_24h_change ?? 0;

    const qty = parseFloat(amount);
    const invested = parseFloat(total);
    const txPrice = parseFloat(price);
    const createdAt = timestamp ? new Date(timestamp) : new Date();

    const existing = user.coins.find((c) => c.symbol === validatedSymbol);

    // ✅ SELL VALIDATION
    if (type === 'sell') {
      if (!existing || existing.quantity < qty) {
        return NextResponse.json({ error: 'Not enough holdings to sell' }, { status: 400 });
      }

      existing.quantity -= qty;
      existing.totalInvested -= invested;
      existing.averagePrice = existing.quantity > 0
        ? existing.totalInvested / existing.quantity
        : 0;
    }

    // ✅ BUY LOGIC
    else if (type === 'buy') {
      if (existing) {
        const totalQty = existing.quantity + qty;
        const totalVal = existing.totalInvested + invested;

        existing.quantity = totalQty;
        existing.totalInvested = totalVal;
        existing.averagePrice = totalVal / totalQty;
      } else {
        user.coins.push({
          coinId: metadata.id,
          symbol: validatedSymbol,
          name: metadata.name,
          image: metadata.image,
          currentPrice,
          priceChangePercentage24h,
          totalInvested: invested,
          averagePrice: txPrice,
          quantity: qty,
          createdAt,
        });
      }
    }

    // ✅ TRANSFER LOGIC (record only)
    else if (type === 'transfer') {
      // Optional: implement logic to track source/destination wallet later
    }

    // ✅ Update or overwrite pricing data
    if (existing) {
      existing.currentPrice = currentPrice;
      existing.priceChangePercentage24h = priceChangePercentage24h;
    }

    // ✅ Add to transaction history
    user.transactions.push({
      type,
      symbol: validatedSymbol,
      coinId: metadata.id,
      price: txPrice,
      quantity: qty,
      total: invested,
      timestamp: createdAt,
    });

    // ✅ Recalculate portfolio values
    let totalInvested = 0;
    let totalCurrentValue = 0;

    user.coins.forEach((coin) => {
      totalInvested += coin.totalInvested;
      totalCurrentValue += coin.quantity * coin.currentPrice;
    });

    user.totalInvested = parseFloat(totalInvested.toFixed(2));
    user.totalCurrentValue = parseFloat(totalCurrentValue.toFixed(2));
    user.totalProfit = parseFloat((totalCurrentValue - totalInvested).toFixed(2));

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADD TX ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}