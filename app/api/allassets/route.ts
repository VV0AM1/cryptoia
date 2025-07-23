import { NextRequest, NextResponse } from 'next/server';
import { getAssets } from '@/lib/coinService';

export const dynamic = 'force-dynamic'; 


export async function GET(req: NextRequest) {
  try {
    const assets = await getAssets();
    return NextResponse.json({ fetchedAt: new Date().toISOString(), assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}