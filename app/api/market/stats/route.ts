import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'marketStats.json');

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest) {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const cached = JSON.parse(raw);

    const now = new Date();
    const lastUpdated = new Date(cached.lastUpdated);
    const diffHours = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return NextResponse.json({
        totalMarketCap: cached.totalMarketCap,
        totalVolume: cached.totalVolume,
        btcDominance: cached.btcDominance,
        cached: true,
      });
    }

    const { data: binanceData } = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const usdtPairs = binanceData.filter((pair: any) => pair.symbol.endsWith('USDT'));

    const topPairs = usdtPairs
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, 20);

    const totalVolume = topPairs.reduce(
      (sum: number, pair: any) => sum + parseFloat(pair.quoteVolume),
      0
    );

    const btc = topPairs.find((pair: any) => pair.symbol === 'BTCUSDT');
    const btcVolume = btc ? parseFloat(btc.quoteVolume) : 0;
    const btcDominance = totalVolume > 0 ? (btcVolume / totalVolume) * 100 : 0;

    const { data: geckoData } = await axios.get('https://api.coingecko.com/api/v3/global');
    const totalMarketCap = geckoData.data.total_market_cap.usd;

    const newStats = {
      totalMarketCap,
      totalVolume,
      btcDominance,
      lastUpdated: new Date().toISOString(),
    };

    await fs.writeFile(DATA_PATH, JSON.stringify(newStats, null, 2), 'utf-8');

    return NextResponse.json({ ...newStats, cached: false });
  } catch (err) {
    console.error('Failed to fetch market stats:', err);
    return NextResponse.json({ error: 'Failed to load market stats' }, { status: 500 });
  }
}