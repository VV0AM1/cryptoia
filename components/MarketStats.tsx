'use client';
import { useEffect, useState } from 'react';
import { getMarketStats } from '@/lib/marketService';

export default function MarketStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const delay = setTimeout(() => {
      getMarketStats().then(data => {
        setStats(data);
        setLoading(false);
      });
    }, 1000);

    return () => clearTimeout(delay);
  }, []);

  if (loading || !stats) {
    return <div className="w-full min-h-[180px] bg-zinc-800 border border-zinc-700 rounded-2xl p-4 animate-pulse" />;
  }

  return (
    <div className="bg-zinc-800 border h-full border-zinc-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-sm text-white space-y-4 w-full min-h-[180px]">
      <h2 className="text-white text-sm font-semibold mb-2">📊 Market Overview</h2>
      <div className="divide-y h-[90%] flex flex-col justify-center divide-zinc-700">
        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">💰 Total M.Cap</span>
          <span className="font-semibold text-green-400">${(stats.total_market_cap.usd / 1e12).toFixed(2)} T</span>
        </div>
        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">📈 Dominance</span>
          <span className="font-semibold text-blue-400">{stats.market_cap_percentage.btc.toFixed(2)}%</span>
        </div>
        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">🔄 24h Volume</span>
          <span className="font-semibold text-yellow-400">${(stats.total_volume.usd / 1e9).toFixed(2)} B</span>
        </div>
      </div>
    </div>
  );
}