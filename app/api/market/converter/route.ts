import { NextRequest, NextResponse } from 'next/server';
import rawSymbolMap from '@/data/symbolMap.json';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Meta = { id?: string; name: string; image: string };
const symbolMap = rawSymbolMap as Record<string, Meta>;

type CacheRow = { p: number | null; ch: number | null; t: number };
const coinCache = new Map<string, CacheRow>();
let lastCoinBatchAt = 0;

const TOP5: string[] = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'].filter((s) => symbolMap[s]);

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

type FiatDef = { code: string; name: string };
const FIATS: FiatDef[] = [
  { code: 'USD', name: 'US Dollar' },       
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'RUB', name: 'Russian Ruble' },
];

let allSymbols: Set<string> | null = null;
let lastSymbolsAt = 0;

async function ensureAllSymbols() {
  const STALE_MS = 6 * 60 * 60 * 1000; 
  const now = Date.now();
  if (allSymbols && now - lastSymbolsAt < STALE_MS) return;

  const res = await fetch('https://api.binance.com/api/v3/exchangeInfo', { cache: 'no-store' });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('[converter] exchangeInfo failed', res.status, t);
    return; 
  }
  const data = await res.json();
  const set = new Set<string>();
  for (const s of data?.symbols ?? []) {
    if (s?.symbol) set.add(s.symbol as string);
  }
  allSymbols = set;
  lastSymbolsAt = now;
}

type FiatResolved = { code: string; name: string; pair: string | null; inverse: boolean };

function resolveFiatPairs(): FiatResolved[] {
  if (!allSymbols) return FIATS.map(f => ({ code: f.code, name: f.name, pair: null, inverse: false }));

  return FIATS.map((f) => {
    if (f.code === 'USD') return { code: f.code, name: f.name, pair: null, inverse: false }; // 1:1

    const direct = `${f.code}USDT`;
    const inverse = `USDT${f.code}`;
    if (allSymbols!.has(direct)) return { code: f.code, name: f.name, pair: direct, inverse: false };
    if (allSymbols!.has(inverse)) return { code: f.code, name: f.name, pair: inverse, inverse: true };
    return { code: f.code, name: f.name, pair: null, inverse: false };
  });
}

async function fetchTickerBatch(symbols: string[]) {
  if (symbols.length === 0) return [];
  const qs = encodeURIComponent(JSON.stringify(symbols));
  const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${qs}`, { cache: 'no-store' });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    console.error('[converter] ticker price batch failed', res.status, t);
    return [];
  }
  const arr = await res.json();
  return Array.isArray(arr) ? arr : [];
}

async function fetchCoinBatch(symbols: string[]) {
  if (symbols.length === 0) return { prices: [], stats: [] as any[] };
  const qs = encodeURIComponent(JSON.stringify(symbols));
  const [priceRes, statsRes] = await Promise.all([
    fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${qs}`, { cache: 'no-store' }),
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${qs}`, { cache: 'no-store' }),
  ]);

  if (!priceRes.ok || !statsRes.ok) {
    const pt = await priceRes.text().catch(() => '');
    const st = await statsRes.text().catch(() => '');
    console.error('[converter] coin upstream not ok', priceRes.status, pt, statsRes.status, st);
    return { prices: [], stats: [] };
  }

  const prices = await priceRes.json();
  const stats = await statsRes.json();
  return { prices: Array.isArray(prices) ? prices : [], stats: Array.isArray(stats) ? stats : [] };
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const q = sp.get('q');
    const limit = Math.min(Number(sp.get('limit') ?? (q ? 10 : 5)), 20);

    const coinSymbols = pickCandidates(q, limit);

    const now = Date.now();

    const canHitCoins = now - lastCoinBatchAt > 4000;
    if (canHitCoins && coinSymbols.length > 0) {
      const { prices, stats } = await fetchCoinBatch(coinSymbols);

      const lastBySymbol = new Map<string, number>();
      const chgBySymbol = new Map<string, number>();

      for (const r of prices) {
        const s = r?.symbol; const p = Number(r?.price);
        if (s && Number.isFinite(p)) lastBySymbol.set(s, p);
      }
      for (const r of stats) {
        const s = r?.symbol; const ch = Number(r?.priceChangePercent);
        if (s && Number.isFinite(ch)) chgBySymbol.set(s, ch);
      }

      const ts = Date.now();
      coinSymbols.forEach((s) => {
        const prev = coinCache.get(s);
        const p = lastBySymbol.get(s) ?? prev?.p ?? null;
        const ch = chgBySymbol.get(s) ?? prev?.ch ?? null;
        coinCache.set(s, { p, ch, t: ts });
      });
      lastCoinBatchAt = ts;
    }

    await ensureAllSymbols();
    const resolved = resolveFiatPairs();
    const activePairs = resolved.map(r => r.pair).filter((p): p is string => !!p);

    const fiatTicker = await fetchTickerBatch(activePairs);
    const priceBySymbol = new Map<string, number>();
    for (const r of fiatTicker) {
      const s = r?.symbol; const p = Number(r?.price);
      if (s && Number.isFinite(p)) priceBySymbol.set(s, p);
    }

    const coins = coinSymbols.map((sym) => {
      const meta = symbolMap[sym]!;
      const hit = coinCache.get(sym);
      return {
        id: sym,
        symbol: sym.replace('USDT', ''),
        name: meta.name,
        image: meta.image,
        priceUSDT: hit?.p ?? null,
        change24h: hit?.ch ?? null,
      };
    });

    const fiats = resolved.map((r) => {
      if (r.code === 'USD') {
        return { code: r.code, name: r.name, pair: null as string | null, rateUSDT: 1 };
      }
      if (!r.pair) {
        return { code: r.code, name: r.name, pair: null as string | null, rateUSDT: null };
      }
      const px = priceBySymbol.get(r.pair) ?? null;
      const rateUSDT =
        px == null ? null : (r.inverse ? (px > 0 ? 1 / px : null) : px);
      return { code: r.code, name: r.name, pair: r.pair, rateUSDT };
    });

    return NextResponse.json({ coins, fiats });
  } catch (err) {
    console.error('[converter] error', err);
    return NextResponse.json({ coins: [], fiats: [] }, { status: 200 });
  }
}