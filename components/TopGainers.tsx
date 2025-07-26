'use client';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { getAssets } from '@/lib/coinService';
import { Coin } from './CoinSection';

export default function TopGainers() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      getAssets().then((data) => {
        const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        setCoins(sorted.slice(0, 5));
        setLoading(false);
      });
    }, 1000);

    return () => clearTimeout(delay);
  }, []);

  if (loading) {
    return <div className="w-full min-h-[180px] bg-zinc-800 border border-zinc-700 rounded-2xl p-4 animate-pulse" />;
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-white text-sm font-semibold flex items-center gap-2">
          <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
          Top Gainers
        </h2>
        <button className="text-xs text-blue-400 hover:underline">See More</button>
      </div>
      <ul className="text-sm divide-y divide-zinc-700">
        {coins.map((coin) => (
          <li key={coin.id} className="py-2 flex justify-between items-center hover:bg-zinc-700/40 px-2 rounded-lg transition-all">
            <div className="flex items-center gap-2">
              <img src={coin.image} alt={coin.name} className="w-5 h-5" />
              <span className="text-white font-medium">{coin.symbol.toUpperCase()}</span>
              <span className="text-zinc-400 text-xs">{coin.name}</span>
            </div>
            <div className="text-green-400 font-semibold text-right text-xs">
              {coin.price_change_percentage_24h.toFixed(2)}%
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}        