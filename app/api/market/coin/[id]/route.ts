import { NextRequest, NextResponse } from 'next/server';
import axios from '@/lib/axiosBinance';
import symbolMap from '@/data/symbolMap.json' assert { type: 'json' };

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const symbol = params.id.toUpperCase();

    const { data } = await axios.get('/ticker/24hr', {
      params: { symbol },
    });

    const map = symbolMap as Record<string, { name: string; image: string; id?: string }>;
    const metadata = map[symbol];

    const coin = {
      id: metadata?.id || symbol, // 👈 Use the CoinGecko ID
      symbol,
      name: metadata?.name || symbol,
      image: metadata?.image || '/default-coin.png',
      currentPrice: parseFloat(data.lastPrice),
      priceChangePercentage24h: parseFloat(data.priceChangePercent),
    };

    return NextResponse.json(coin);
  } catch (error) {
    console.error('[API] Failed to fetch coin:', error);
    return NextResponse.json({ error: 'Failed to fetch coin' }, { status: 500 });
  }
}