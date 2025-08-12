import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const rawId = String(params?.id || '').toUpperCase().trim(); // e.g., BTCUSDT
    if (!rawId || !/^[A-Z0-9]+$/.test(rawId)) {
      return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
    }

    // Derive a base symbol from things like BTCUSDT, ETHUSDT, SOLUSDT, etc.
    // If it ends with USDT/USDC/BUSD/FDUSD/TUSD, strip the quote asset.
    const QUOTE_ASSETS = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'TUSD', 'USD'];
    const quote = QUOTE_ASSETS.find(q => rawId.endsWith(q));
    const baseSymbol = quote ? rawId.slice(0, -quote.length) : rawId; // e.g., BTC

    // 1) Price from Binance
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
      // keep going; we'll still return name/image from CoinGecko
      console.error('[coin:id] Binance price fetch failed:', e);
    }

    // 2) Name/Image (and a stable CoinGecko id) from CoinGecko Search
    //    We look for the first exact symbol match (case-insensitive).
    let cgId = '';
    let name = baseSymbol;
    let image = '/default-coin.png';

    try {
      const headers: Record<string, string> = { 'User-Agent': 'YourApp/1.0' };
      if (process.env.COINGECKO_API_KEY) {
        headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
      }
      const searchRes = await fetch(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(baseSymbol)}`,
        { headers, cache: 'no-store' }
      );

      if (searchRes.ok) {
        const search = await searchRes.json();
        const coins: any[] = Array.isArray(search?.coins) ? search.coins : [];

        // Prefer exact symbol match; otherwise fall back to first hit
        const exact =
          coins.find(c => String(c?.symbol || '').toUpperCase() === baseSymbol.toUpperCase()) ||
          coins[0];

        if (exact) {
          cgId = String(exact.id || '');
          name = String(exact.name || name);
          image = String(exact.thumb || image);
        }
      }
    } catch (e) {
      console.error('[coin:id] CoinGecko search failed:', e);
    }

    // Optional: If Binance price wasn’t available, try CoinGecko markets as a fallback
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
          if (first?.image && image === '/default-coin.png') image = String(first.image);
          if (first?.name) name = String(first.name);
        }
      } catch (e) {
        console.error('[coin:id] CoinGecko markets fallback failed:', e);
      }
    }

    // Final shape expected by your front-end AddTransactionModal / NavBar
    return NextResponse.json({
      id: rawId,                // keep the Binance-style id you pass in (e.g., BTCUSDT)
      symbol: baseSymbol,       // e.g., BTC
      name,                     // pretty name from CG (fallback: baseSymbol)
      image,                    // icon/thumbnail from CG (fallback: default)
      currentPrice: Number(currentPrice) || 0,
    });
  } catch (err: any) {
    console.error('[API /market/coin/:id] Failed:', err?.message || err);
    return NextResponse.json({ error: 'Failed to load coin' }, { status: 500 });
  }
}