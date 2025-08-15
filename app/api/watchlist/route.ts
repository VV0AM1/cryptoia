import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import type { ICoin } from '@/types/coin';

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectToDatabase();
  const user = await User.findOne({ email: token.email }).select('watchlist');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json(user.watchlist ?? []);
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const incoming = body?.coin;

  const coin: ICoin = {
    coinId: incoming.coinId ?? incoming.id, 
    symbol: incoming.symbol,
    name: incoming.name,
    image: incoming.image,
    currentPrice: incoming.currentPrice ?? incoming.current_price,
    priceChangePercentage24h:
      incoming.priceChangePercentage24h ?? incoming.price_change_percentage_24h,
    totalInvested: incoming.totalInvested ?? 0,
    averagePrice: incoming.averagePrice ?? 0,
    quantity: incoming.quantity ?? 0,
    createdAt: incoming.createdAt ? new Date(incoming.createdAt) : new Date(),
  };

  if (
    !coin.coinId || !coin.symbol || !coin.name || !coin.image ||
    typeof coin.currentPrice !== 'number' ||
    typeof coin.priceChangePercentage24h !== 'number'
  ) {
    return NextResponse.json({ error: 'Invalid coin payload' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: token.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!Array.isArray(user.watchlist)) user.watchlist = [];

  const exists = user.watchlist.some(
    (c: ICoin) => c.symbol.toUpperCase() === coin.symbol.toUpperCase()
  );
  if (!exists) {
    user.watchlist.push(coin);
    await user.save();
  }

  return NextResponse.json({ message: 'Added to watchlist' });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const symbol = String(body?.coin?.symbol || '').toUpperCase();
  const coinId = String(body?.coin?.coinId || body?.coin?.id || '');

  if (!symbol && !coinId) {
    return NextResponse.json({ error: 'Provide coin.symbol or coin.coinId' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: token.email });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const before = user.watchlist.length;
  user.watchlist = user.watchlist.filter((c: ICoin) => {
    const symMatch = symbol && c.symbol.toUpperCase() === symbol;
    const idMatch = coinId && c.coinId === coinId;
    return !(symMatch || idMatch);
  });
  if (user.watchlist.length !== before) await user.save();

  return NextResponse.json({ message: 'Removed from watchlist' });
}