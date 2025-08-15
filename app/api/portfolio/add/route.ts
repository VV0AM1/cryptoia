import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import rawSymbolMap from '@/data/symbolMap.json';
import axios from 'axios';

type Meta = { name: string; image: string; id?: string };
const symbolMap = rawSymbolMap as Record<string, Meta>;

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { symbol, amount, price, total, coinId, type = 'buy', timestamp } = body;

    if (!symbol || !amount || !price || !total || !coinId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: token.email });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let entry: [string, Meta] | undefined =
      Object.entries(symbolMap).find(([, m]) => m.id === coinId) ||
      (symbolMap[coinId] ? [coinId, symbolMap[coinId]] : undefined);

    if (!entry) return NextResponse.json({ error: 'Unsupported asset' }, { status: 400 });
    const [validatedSymbol, meta] = entry;

    if (!meta.id) return NextResponse.json({ error: 'Missing upstream id in metadata' }, { status: 400 });

    let currentPrice = 0;
    let priceChangePercentage24h = 0;
    try {
      const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: meta.id,
          vs_currencies: 'usd',
          include_24hr_change: 'true',
        },
      });
      currentPrice = Number(data?.[meta.id]?.usd ?? 0);
      priceChangePercentage24h = Number(data?.[meta.id]?.usd_24h_change ?? 0);
    } catch {
    }

    const qty = Number(amount);
    const invested = Number(total);
    const txPrice = Number(price);
    const createdAt = timestamp ? new Date(timestamp) : new Date();

    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    let existing = user.coins.find((c: any) => c.symbol === validatedSymbol);

    if (type === 'sell') {
      const have = Number(existing?.quantity ?? 0);
      if (!existing || have <= 0) {
        return NextResponse.json({ error: 'You have 0 to sell', max: 0 }, { status: 400 });
      }
      if (qty > have + 1e-12) {
        return NextResponse.json({ error: 'Amount exceeds your holdings', max: have }, { status: 400 });
      }

      const costToRemove = Number(existing.averagePrice) * qty;
      existing.quantity = Math.max(0, have - qty);
      existing.totalInvested = Math.max(0, Number(existing.totalInvested) - costToRemove);
      existing.averagePrice = existing.quantity > 0
        ? Number(existing.totalInvested) / Number(existing.quantity)
        : 0;

      if (existing.quantity <= 0) {
        user.coins = user.coins.filter((c: any) => c.symbol !== validatedSymbol);
        existing = undefined;
      }
    }

    if (type === 'buy') {
      if (existing) {
        const newQty  = Number(existing.quantity) + qty;
        const newCost = Number(existing.totalInvested) + invested; 
        existing.quantity = newQty;
        existing.totalInvested = newCost;
        existing.averagePrice = newQty > 0 ? newCost / newQty : 0;
      } else {
        user.coins.push({
          coinId: meta.id,
          symbol: validatedSymbol,
          name: meta.name,
          image: meta.image,
          currentPrice,
          priceChangePercentage24h,
          totalInvested: invested,
          averagePrice: txPrice,
          quantity: qty,
          createdAt,
        });
      }
    }


    if (existing) {
      existing.currentPrice = currentPrice || existing.currentPrice;
      existing.priceChangePercentage24h = priceChangePercentage24h || existing.priceChangePercentage24h;
    }

    user.transactions.push({
      type,
      symbol: validatedSymbol,
      coinId: meta.id,
      price: txPrice,
      quantity: qty,
      total: invested,
      timestamp: createdAt,
    });

    let totalInvestedSum = 0;
    let totalCurrentValue = 0;
    for (const c of user.coins) {
      totalInvestedSum += Number(c.totalInvested);
      totalCurrentValue += Number(c.quantity) * Number(c.currentPrice);
    }
    user.totalInvested = +totalInvestedSum.toFixed(2);
    user.totalCurrentValue = +totalCurrentValue.toFixed(2);
    user.totalProfit = +(user.totalCurrentValue - user.totalInvested).toFixed(2);

    await user.save();

    return NextResponse.json({
      success: true,
      portfolio: {
        totalInvested: user.totalInvested,
        totalCurrentValue: user.totalCurrentValue,
        totalProfit: user.totalProfit,
      },
    });
  } catch (error) {
    console.error('[ADD TX ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}