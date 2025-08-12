import { NextResponse } from 'next/server';
import rawSymbolMap from '@/data/symbolMap.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Meta = { id?: string; name: string; image: string };
const symbolMap = rawSymbolMap as Record<string, Meta>;

export async function GET(req: Request) {
  try {
    // read [id] from URL to avoid Netlify typing issues
    const { pathname } = new URL(req.url);
    const rawId = (pathname.split('/').pop() || '').toUpperCase(); // e.g. BTCUSDT
    if (!rawId || !/^[A-Z0-9]+$/.test(rawId)) {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    // use the pair key (BTCUSDT) for metadata
    const meta = symbolMap[rawId];

    // derive base symbol only for the "symbol" field
    const QUOTES = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'USD'];
    const quote = QUOTES.find(q => rawId.endsWith(q));
    const baseSymbol = quote ? rawId.slice(0, -quote.length) : rawId;

    let name = meta?.name ?? baseSymbol;
    let image = meta?.image ?? '/default-coin.png';
    const cgId = meta?.id || '';

    // price from Binance (primary)
    let currentPrice = 0;
    try {
      const r = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(rawId)}`,
        { cache: 'no-store' }
      );
      if (r.ok) {
        const j = await r.json();
        const p = Number(j?.price);
        if (!Number.isNaN(p)) currentPrice = p;
      }
    } catch (e) {
      console.error('[coin:id] Binance fetch failed:', e);
    }

    // fallback price from CoinGecko if Binance lacks the pair
    if (!currentPrice && cgId) {
      try {
        const headers: Record<string, string> = { 'User-Agent': 'YourApp/1.0' };
        if (process.env.COINGECKO_API_KEY) headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
        const r = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(cgId)}`,
          { headers, cache: 'no-store' }
        );
        if (r.ok) {
          const arr = await r.json();
          const first = Array.isArray(arr) ? arr[0] : null;
          const p = Number(first?.current_price);
          if (!Number.isNaN(p)) currentPrice = p;
        }
      } catch (e) {
        console.error('[coin:id] CG fallback failed:', e);
      }
    }

    return NextResponse.json({
      id: rawId,                 // BTCUSDT (pair)
      symbol: baseSymbol,        // BTC (base)
      name,                      // from your JSON
      image,                     // from your JSON
      currentPrice: Number(currentPrice) || 0,
    });
  } catch (err: any) {
    console.error('[API /market/coin/:id] Failed:', err?.message || err);
    return NextResponse.json({ error: 'Failed to load coin' }, { status: 500 });
  }
}