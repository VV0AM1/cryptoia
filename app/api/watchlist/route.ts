import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { coin } = await req.json();
  if (!coin || !coin.symbol) {
    return NextResponse.json({ error: 'Invalid coin' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: token.email });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const already = user.watchlist.find((c) => c.symbol === coin.symbol);
  if (already) {
    return NextResponse.json({ message: 'Already in watchlist' });
  }

  user.watchlist.push(coin);
  await user.save();

  return NextResponse.json({ message: 'Added to watchlist' });
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { coin } = await req.json();
  if (!coin || !coin.symbol) {
    return NextResponse.json({ error: 'Invalid coin' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findOne({ email: token.email });

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  user.watchlist = user.watchlist.filter((c) => c.symbol !== coin.symbol);
  await user.save();

  return NextResponse.json({ message: 'Removed from watchlist' });
}