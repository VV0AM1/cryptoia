import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BINANCE = 'https://api.binance.com';
const UA = { 'User-Agent': 'CryptoIA/1.0' };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get('symbol') || '').toUpperCase();
  if (!symbol) return NextResponse.json({ error: 'Missing symbol' }, { status: 400 });

  const r = await fetch(`${BINANCE}/api/v3/ticker/price?symbol=${symbol}`, {
    cache: 'no-store',
    headers: UA,
  });

  if (!r.ok) {
    const text = await r.text().catch(() => '');
    console.error('[price] upstream not ok', r.status, text);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }

  const j = await r.json();
  const price = Number(j?.price ?? 0);
  return NextResponse.json({ symbol, price: Number.isFinite(price) ? price : 0 });
}