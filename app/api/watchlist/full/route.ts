import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import rawSymbolMap from '@/data/symbolMap.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SymbolMeta = { id?: string; name: string; image: string };
const symbolMap = rawSymbolMap as Record<string, SymbolMeta>;

const QUOTES = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'USD'];

function baseFromPair(pair: string) {
  const up = pair.toUpperCase();
  const quote = QUOTES.find(q => up.endsWith(q));
  return quote ? up.slice(0, -quote.length) : up;
}

async function pMap<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const ret: R[] = [];
  let i = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(runners);
  return ret;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: token.email }).select('watchlist');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const items = Array.isArray(user.watchlist) ? user.watchlist : [];
    if (items.length === 0) return NextResponse.json({ assets: [] });

    const symbols = items.map((w: any) => String(w.coinId || '').toUpperCase()).filter(Boolean);
    if (!symbols.length) return NextResponse.json({ assets: [] });

    let tickers: any[] = [];
    try {
      const q = encodeURIComponent(JSON.stringify(symbols));
      const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${q}`, { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        tickers = Array.isArray(j) ? j : [j];
      } else {
        tickers = await Promise.all(
          symbols.map(async s => {
            const rr = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`, { cache: 'no-store' });
            return rr.ok ? rr.json() : null;
          })
        ).then(arr => arr.filter(Boolean) as any[]);
      }
    } catch (e) {
      console.error('[watchlist/full/binance] 24hr fetch error:', e);
    }

    const tMap = new Map<string, any>();
    for (const t of tickers) tMap.set(String(t.symbol).toUpperCase(), t);

    const klinesResults = await pMap(symbols, 5, async (s) => {
      try {
        const rr = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${s}&interval=1h&limit=168`,
          { cache: 'no-store' }
        );
        if (!rr.ok) return { symbol: s, closes: [] as number[], pct7d: 0 };
        const arr = await rr.json();
        const closes = Array.isArray(arr) ? arr.map((row: any[]) => Number(row[4])).filter((n: number) => !Number.isNaN(n)) : [];
        let pct7d = 0;
        if (closes.length >= 2) {
          const first = closes[0];
          const last = closes[closes.length - 1];
          if (first > 0) pct7d = ((last - first) / first) * 100;
        }
        return { symbol: s, closes, pct7d };
      } catch (e) {
        console.error('[watchlist/full/binance] kline error:', s, e);
        return { symbol: s, closes: [] as number[], pct7d: 0 };
      }
    });

    const kMap = new Map<string, { closes: number[]; pct7d: number }>();
    klinesResults.forEach(k => kMap.set(k.symbol, { closes: k.closes, pct7d: k.pct7d }));

    const assets = symbols.map((pair) => {
      const t = tMap.get(pair);
      const k = kMap.get(pair);
      const meta = symbolMap[pair];

      const last = t ? Number(t.lastPrice) : (k?.closes.at(-1) ?? 0);
      const pct24 = t ? Number(t.priceChangePercent) : 0;
      const quoteVol = t ? Number(t.quoteVolume) : 0;

      return {
        id: pair, 
        market_cap_rank: 0,
        symbol: baseFromPair(pair),
        name: meta?.name ?? baseFromPair(pair),
        image: meta?.image ?? '/default-coin.png',
        current_price: Number.isFinite(last) ? last : 0,
        price_change_percentage_24h: Number.isFinite(pct24) ? pct24 : 0,
        price_change_percentage_7d_in_currency: Number.isFinite(k?.pct7d ?? 0) ? (k?.pct7d ?? 0) : 0,
        market_cap: 0, 
        total_volume: Number.isFinite(quoteVol) ? quoteVol : 0,
        sparkline_in_7d: { price: k?.closes ?? [] },
      };
    });

    return NextResponse.json({ assets });
  } catch (err: any) {
    console.error('[watchlist/full/binance] error:', err?.message || err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}