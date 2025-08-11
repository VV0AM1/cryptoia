import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const headers: Record<string, string> = { 'User-Agent': 'YourApp/1.0' };

    if (process.env.COINGECKO_API_KEY) {
      headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY as string;
    }

    const url =
      'https://api.coingecko.com/api/v3/coins/markets' +
      '?vs_currency=usd' +
      '&order=market_cap_desc' +
      '&per_page=250' +
      '&page=1' +
      '&sparkline=true' +
      '&price_change_percentage=24h,7d';

    const res = await fetch(url, {
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[allassets] CG response not ok:', res.status, text);
      return NextResponse.json({ error: 'CoinGecko upstream error' }, { status: 502 });
    }

    const data = await res.json();

    const top = (Array.isArray(data) ? data : []).slice(0, 15).map((c: any) => {
      const binanceLikeSymbol = (String(c.symbol || '') + 'USDT').toUpperCase();

      return {
        id: binanceLikeSymbol,
        symbol: String(c.symbol || '').toUpperCase(),
        name: c.name ?? binanceLikeSymbol,
        image: c.image ?? '/default-coin.png',
        current_price: Number(c.current_price ?? 0),
        price_change_percentage_24h: Number(
          c.price_change_percentage_24h_in_currency ??
            c.price_change_percentage_24h ??
            0
        ),
        price_change_percentage_7d_in_currency: Number(
          c.price_change_percentage_7d_in_currency ?? 0
        ),
        market_cap: Number(c.market_cap ?? 0),
        total_volume: Number(c.total_volume ?? 0),
        sparkline_in_7d: {
          price: Array.isArray(c.sparkline_in_7d?.price)
            ? c.sparkline_in_7d.price
                .map((n: any) => Number(n))
                .filter((n: any) => !Number.isNaN(n))
            : [],
        },
      };
    });

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      assets: top,
    });
  } catch (error: any) {
    console.error('[API /allassets] Failed:', error?.message || error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}