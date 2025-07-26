import { NextRequest, NextResponse } from 'next/server';
import { getAssets } from '@/lib/coinService';
import { getCachedAssets } from '@/lib/cache';

export const dynamic = 'force-dynamic'; 

export async function GET(req: NextRequest) {
  try {
    const assets = await getCachedAssets(getAssets, 30000); 
    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      assets,
    });
  } catch (error) {
    console.error('[API] Failed to fetch assets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}