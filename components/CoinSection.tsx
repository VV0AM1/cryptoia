'use client';

import { useState, useEffect } from 'react';
import CoinCard from './CoinCard';
import { useSidebar } from '@/app/context/SidebarContext';

export type Coin = {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
  image: string;
};

export default function CoinSection() {
  const [assets, setAssets] = useState<Coin[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOpened } = useSidebar();

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/allassets', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (alive) {
          setAssets(Array.isArray(data.assets) ? data.assets : []);
          setError('');
        }
      } catch {
        if (alive) setError('Error fetching assets');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';
  const gridHeader = 'grid grid-cols-5 sm:grid-cols-9 gap-4 items-center text-xs text-zinc-400';

  if (loading) {
    return (
      <div className={`flex flex-col ${marginLeft} ${contentWidth} bg-zinc-800 p-4 sm:p-6 md:p-8 rounded-3xl`}>
        <div className={`${gridHeader} border-b border-zinc-700 pb-2`}>
          <p className="hidden sm:block">Watchlist</p>
          <p>Asset</p>
          <p className="text-right">Price</p>
          <p className="text-right">24h %</p>
          <p className="text-right">7d %</p>
          <p className="text-right">Market Cap</p>
          <p className="text-right hidden sm:block">24h Volume</p>
          <p className="text-right hidden sm:block">7d Chart</p>
        </div>

        <div className="divide-y divide-zinc-700 mt-4 space-y-2 animate-pulse">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 sm:grid-cols-9 gap-4 items-center py-4">
              <div className="hidden sm:block h-4 w-4 bg-zinc-700 rounded" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-700" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 bg-zinc-700 rounded" />
                  <div className="h-2 w-10 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-14 bg-zinc-700 rounded justify-self-end" />
              <div className="h-3 w-10 bg-zinc-700 rounded justify-self-end" />
              <div className="h-3 w-10 bg-zinc-700 rounded justify-self-end" />
              <div className="h-3 w-16 bg-zinc-700 rounded justify-self-end" />
              <div className="h-3 w-16 bg-zinc-700 rounded justify-self-end hidden sm:block" />
              <div className="h-6 w-full bg-zinc-700 rounded hidden sm:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col ${marginLeft} ${contentWidth} bg-zinc-800 p-6 rounded-3xl`}>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${marginLeft} ${contentWidth} bg-zinc-800 p-4 sm:p-6 md:p-8 rounded-3xl`}>
      <div className={`${gridHeader} border-b border-zinc-600 pb-2`}>
        <p className="hidden sm:block">Watchlist</p>
        <p>Asset</p>
        <p className="text-right">Price</p>
        <p className="text-right">24h %</p>
        <p className="text-right">7d %</p>
        <p className="text-right">Market Cap</p>
        <p className="text-right hidden sm:block">24h Volume</p>
        <p className="text-right hidden sm:block">7d Chart</p>
      </div>

      {assets.map((coin) => (
        <CoinCard key={coin.id} coin={coin} />
      ))}
    </div>
  );
}