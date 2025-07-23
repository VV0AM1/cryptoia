import { NextResponse } from 'next/server';
import { getAssetHistory } from '@/lib/coinService';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const coin = searchParams.get('coin') || 'bitcoin';

  try {
    const history = await getAssetHistory(coin, 'd1');

    const formatted = history.map((entry: any) => ({
      date: new Date(entry.time).toLocaleDateString(),
      price: parseFloat(entry.priceUsd).toFixed(2),
    }));

    return NextResponse.json(formatted);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}