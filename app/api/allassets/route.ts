import { NextRequest, NextResponse } from 'next/server';
import axios from '@/lib/axiosBinance';
import rawSymbolMap from '@/data/symbolMap.json';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { data: stats } = await axios.get('/ticker/24hr');
    const symbolMap = rawSymbolMap as Record<string, { name: string; image: string }>;
    const marketCapMap: Record<string, number> = require('@/data/marketCapMap.json');

    const usdtAssets = stats.filter((asset: any) => asset.symbol.endsWith('USDT'));

    const sortedAssets = usdtAssets
      .filter((asset: any) => marketCapMap[asset.symbol]) 
      .sort((a: any, b: any) => marketCapMap[b.symbol] - marketCapMap[a.symbol]);

    const topAssetsRaw = sortedAssets.slice(0, 15);

    const topAssets = await Promise.all(
      topAssetsRaw.map(async (asset: any) => {
        const symbol = asset.symbol;
        const metadata = symbolMap[symbol] || {
          name: symbol.replace('USDT', ''),
          image: '/default-coin.png',
        };

        const marketCap = marketCapMap[symbol] || 0;
        let sparkline: number[] = [];
        let price_change_percentage_7d_in_currency = 0;

        try {
          const { data: klineData } = await axios.get('/klines', {
            params: {
              symbol,
              interval: '1h',
              limit: 168,
            },
          });

          sparkline = klineData.map((k: any) => parseFloat(k[4]));

          const firstClose = sparkline[0];
          const lastClose = sparkline[sparkline.length - 1];
          if (firstClose && lastClose) {
            price_change_percentage_7d_in_currency = ((lastClose - firstClose) / firstClose) * 100;
          }

        } catch (err) {
          console.warn(`⚠️ Failed to fetch kline for ${symbol}`);
        }

        return {
          id: symbol,
          symbol: symbol.replace('USDT', ''),
          name: metadata.name,
          image: metadata.image,
          current_price: parseFloat(asset.lastPrice),
          price_change_percentage_24h: parseFloat(asset.priceChangePercent),
          price_change_percentage_7d_in_currency,
          market_cap: marketCap,
          total_volume: parseFloat(asset.quoteVolume || '0'),
          sparkline_in_7d: { price: sparkline },
        };
      })
    );

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      assets: topAssets,
    });
  } catch (error) {
    console.error('[API] Failed to fetch assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}