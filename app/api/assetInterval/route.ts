import { NextRequest, NextResponse } from 'next/server';
import { getAssetHistory } from '@/lib/coinService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const days = searchParams.get('days') || '7';

  if (!id) {
    return NextResponse.json({ error: 'Missing asset id' }, { status: 400 });
  }

  try {
    const history = await getAssetHistory(id, days);
    
    if (!Array.isArray(history) || history.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error(`Error fetching history for ${id}:`, error);
    return NextResponse.json([], { status: 200 }); 
  }
}
