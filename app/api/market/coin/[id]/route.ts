import { NextResponse } from 'next/server';
import rawSymbolMap from '@/data/symbolMap.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SymbolMeta = { name: string; image: string; id?: string };
const symbolMap = rawSymbolMap as Record<string, SymbolMeta>;

export async function GET(req: Request) {
  try {
    // Extract [id] from the URL path (no typed context param needed)
    const { pathname } = new URL(req.url);
    const rawId = (pathname.split('/').pop() || '').toUpperCase(); // e.g., BTCUSDT

    if (!rawId || !/^[A-Z0-9]+$/.test(rawId)) {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    // Derive base symbol from common quote assets
    const QUOTE_ASSETS = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'USD'];
    const quote = QUOTE_ASSETS.find(q => rawId.endsWith(q));
    const baseSymbol = quote ? rawId.slice(0, -quote.length) : rawId; // e.g., BTC

    // ---- Name/symbol/image from your own JSON ----
    const meta: SymbolMeta | undefined =
      symbolMap[baseSymbol] ||
      symbolMap[baseSymbol.toUpperCase()] ||
      symbolMap[baseSymbol.toLowerCase()];

    const symbol = baseSymbol;
    const name = meta?.name ?? baseSymbol;
    const image = meta?.image ?? '/default-coin.png';
    const cgId = meta?.id || ''; // optional CoinGecko id

    // ---- Price from Binance (primary) ----
    let currentPrice = 0;
    try {
      const binanceRes = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(rawId)}`,
        { cache: 'no-store' }
      );
      if (binanceRes.ok) {
        const j = await binanceRes.json();
        const p = Number(j?.price);
        if (!Number.isNaN(p)) currentPrice = p;
      }
    } catch (e) {
      console.error('[coin:id] Binance price fetch failed:', e);
    }

    // ---- Fallback price from CoinGecko (only if Binance missing) ----
    if (!currentPrice && cgId) {
      try {
        const headers: Record<string, string> = { 'User-Agent': 'YourApp/1.0' };
        if (process.env.COINGECKO_API_KEY) {
          headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
        }
        const mktRes = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(
            cgId
          )}`,
          { headers, cache: 'no-store' }
        );
        if (mktRes.ok) {
          const arr = await mktRes.json();
          const first = Array.isArray(arr) ? arr[0] : null;
          const p = Number(first?.current_price);
          if (!Number.isNaN(p)) currentPrice = p;
        }
      } catch (e) {
        console.error('[coin:id] CoinGecko markets fallback failed:', e);
      }
    }

    return NextResponse.json({
      id: rawId,          // e.g., BTCUSDT
      symbol,             // e.g., BTC (from your json key)
      name,               // from your json
      image,              // from your json
      currentPrice: Number(currentPrice) || 0,
    });
  } catch (err: any) {
    console.error('[API /market/coin/:id] Failed:', err?.message || err);
    return NextResponse.json({ error: 'Failed to load coin' }, { status: 500 });
  }
}