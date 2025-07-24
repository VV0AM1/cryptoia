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
    let isMounted = true;

    const fetchData = () => {
      fetch('/api/allassets')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setAssets(data.assets);
            setLoading(false);
            setError('');
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Error fetching assets');
            setLoading(false);
          }
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[80px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  if (loading) {
    return (
      <div className={`w-full ${marginLeft} h-screen flex items-center justify-center`}>
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className={`flex flex-col ${marginLeft} ${contentWidth} max-w-7xl bg-zinc-800 p-4 sm:p-6 md:p-8 rounded-3xl overflow-x-auto`}>
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 sm:gap-4 py-2 text-[10px] sm:text-xs text-zinc-400 border-b border-zinc-600">
        <p>#</p>
        <p>Asset</p>
        <p className="text-right">Price</p>
        <p className="text-right">24h %</p>
        <p className="text-right hidden md:block">Market Cap</p>
        <p className="text-right hidden md:block">24h Volume</p>
        <p className="text-right hidden md:block">7d Chart</p>
      </div>

      {assets.map((coin) => (
        <CoinCard key={coin.id} coin={coin} />
      ))}
    </div>
  );
}