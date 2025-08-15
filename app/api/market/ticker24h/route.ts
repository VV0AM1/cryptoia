import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

let lastHit = 0;
let lastRows: any[] = [];

export async function GET(req: NextRequest) {
  try {
    const list = (req.nextUrl.searchParams.get('symbols') || '').trim();
    if (!list) return NextResponse.json([]);

    if (Date.now() - lastHit < 4000 && lastRows.length) {
      return NextResponse.json(lastRows);
    }

    const qs = encodeURIComponent(list);
    const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${qs}`, { cache: 'no-store' });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.error('[ticker24h] upstream not ok', r.status, t);
      return NextResponse.json(lastRows); 
    }

    const rows = await r.json();
    lastRows = Array.isArray(rows) ? rows : [];
    lastHit = Date.now();

    return NextResponse.json(lastRows);
  } catch (e) {
    return NextResponse.json(lastRows);
  }
}