import { NextRequest, NextResponse } from 'next/server';
import rawSymbolMap from '@/data/symbolMap.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Meta = { id?: string; name: string; image: string };
const symbolMap = rawSymbolMap as Record<string, Meta>;

type CacheRow = { p: number | null; ch: number | null; t: number };
const cache = new Map<string, CacheRow>();
let lastBatchAt = 0; 

const TOP5: string[] = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
].filter((s) => symbolMap[s]);

function pickCandidates(q: string | null, limit: number): string[] {
  if (!q) return TOP5.slice(0, limit);
  const Q = q.trim().toUpperCase();
  const keys = Object.keys(symbolMap);

  const hit = keys.filter((k) => {
    if (k.includes(Q)) return true;
    const meta = symbolMap[k];
    if (!meta) return false;
    if (meta.name?.toUpperCase().includes(Q)) return true;
    if (meta.id?.toUpperCase().includes(Q)) return true;
    return false;
  });

  return hit.slice(0, limit);
}

async function fetchBinanceBatch(symbols: string[]) {
  if (symbols.length === 0) return { prices: [], stats: [] as any[] };

  const qs = encodeURIComponent(JSON.stringify(symbols));
  const [priceRes, statsRes] = await Promise.all([
    fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${qs}`, { cache: 'no-store' }),
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${qs}`, { cache: 'no-store' }),
  ]);

  if (!priceRes.ok || !statsRes.ok) {
    const pt = await priceRes.text().catch(() => '');
    const st = await statsRes.text().catch(() => '');
    console.error('[converter] upstream not ok', priceRes.status, pt, statsRes.status, st);
    throw new Error('BINANCE_RATE_LIMIT');
  }

  const prices = await priceRes.json(); 
  const stats = await statsRes.json(); 
  return { prices, stats };
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q');
    const limit = Math.min(Number(sp.get('limit') ?? (q ? 10 : 5)), 20);

    const symbols = pickCandidates(q, limit);

    const now = Date.now();
    const canHit = now - lastBatchAt > 4000;

    if (canHit) {
      try {
        const { prices, stats } = await fetchBinanceBatch(symbols);

        const lastBySymbol = new Map<string, number>();
        const chgBySymbol = new Map<string, number>();

        for (const r of Array.isArray(prices) ? prices : []) {
          const s = r?.symbol; const p = Number(r?.price);
          if (s && Number.isFinite(p)) lastBySymbol.set(s, p);
        }
        for (const r of Array.isArray(stats) ? stats : []) {
          const s = r?.symbol; const ch = Number(r?.priceChangePercent);
          if (s && Number.isFinite(ch)) chgBySymbol.set(s, ch);
        }

        const ts = Date.now();
        symbols.forEach((s) => {
          const p = lastBySymbol.get(s) ?? cache.get(s)?.p ?? null;
          const ch = chgBySymbol.get(s) ?? cache.get(s)?.ch ?? null;
          cache.set(s, { p, ch, t: ts });
        });

        lastBatchAt = ts;
      } catch (e) {
      }
    }

    const coins = symbols.map((sym) => {
      const meta = symbolMap[sym]!;
      const hit = cache.get(sym);
      return {
        id: sym,
        symbol: sym.replace('USDT', ''), 
        name: meta.name,
        image: meta.image,
        priceUSDT: hit?.p ?? null,
        change24h: hit?.ch ?? null,
      };
    });

    return NextResponse.json({ coins });
  } catch (err) {
    console.error('[converter] error', err);
    return NextResponse.json({ coins: [] }, { status: 200 });
  }
}