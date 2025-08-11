import { NextRequest, NextResponse } from 'next/server';
import axios from '@/lib/axiosBinance';
import symbolMapRaw from '@/data/symbolMap.json' assert { type: 'json' };
import marketCapMapRaw from '@/data/marketCapMap.json' assert { type: 'json' };

// Force Node runtime + no caching — avoids Edge/ESM pitfalls and ISR caching of errors
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SymbolMeta = { name: string; image: string };
type MarketCapMap = Record<string, number>;

export async function GET(_req: NextRequest) {
  try {
    // Ensure axiosBinance has a valid baseURL in prod
    // (If axiosBinance relies on env vars, make sure they are set in your host)
    const { data: stats } = await axios.get('/ticker/24hr', {
      // Always safe to send a UA; some providers like it
      headers: { 'User-Agent': 'YourApp/1.0' },
      timeout: 15000,
    });

    const symbolMap = symbolMapRaw as Record<string, SymbolMeta>;
    const marketCapMap = marketCapMapRaw as MarketCapMap;

    // Only USDT pairs
    const usdtAssets = (Array.isArray(stats) ? stats : []).filter(
      (asset: any) => typeof asset?.symbol === 'string' && asset.symbol.endsWith('USDT')
    );

    // Sort by your precomputed market cap map (stable + deterministic)
    const sortedAssets = usdtAssets
      .filter((asset: any) => marketCapMap[asset.symbol])
      .sort((a: any, b: any) => marketCapMap[b.symbol] - marketCapMap[a.symbol]);

    const topAssetsRaw = sortedAssets.slice(0, 15);

    // Fetch 7d sparkline via klines; if it fails for some symbol, we’ll just skip sparkline
    const topAssets = await Promise.all(
      topAssetsRaw.map(async (asset: any) => {
        const symbol: string = asset.symbol;
        const meta: SymbolMeta = symbolMap[symbol] || {
          name: symbol.replace('USDT', ''),
          image: '/default-coin.png',
        };

        const marketCap = marketCapMap[symbol] || 0;
        let sparkline: number[] = [];
        let price_change_percentage_7d_in_currency = 0;

        try {
          const { data: klineData } = await axios.get('/klines', {
            params: { symbol, interval: '1h', limit: 168 },
            headers: { 'User-Agent': 'YourApp/1.0' },
            timeout: 15000,
          });

          if (Array.isArray(klineData)) {
            sparkline = klineData.map((k: any) => parseFloat(k?.[4])).filter((n: any) => !Number.isNaN(n));
            const first = sparkline[0];
            const last = sparkline[sparkline.length - 1];
            if (first && last) {
              price_change_percentage_7d_in_currency = ((last - first) / first) * 100;
            }
          }
        } catch (err) {
          console.warn(`⚠️ Failed to fetch klines for ${symbol}`, err);
        }

        return {
          id: symbol,
          symbol: symbol.replace('USDT', ''),
          name: meta.name,
          image: meta.image,
          current_price: parseFloat(asset.lastPrice ?? '0'),
          price_change_percentage_24h: parseFloat(asset.priceChangePercent ?? '0'),
          price_change_percentage_7d_in_currency,
          market_cap: marketCap,
          total_volume: parseFloat(asset.quoteVolume ?? '0'),
          sparkline_in_7d: { price: sparkline },
        };
      })
    );

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      assets: topAssets,
    });
  } catch (error: any) {
    // Log extra info in prod logs
    console.error('[API /allassets] Failed:', {
      message: error?.message,
      responseStatus: error?.response?.status,
      responseData: error?.response?.data,
    });
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}