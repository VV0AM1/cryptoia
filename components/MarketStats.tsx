'use client';

import { useEffect, useState } from 'react';

type MarketStatsData = {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
};

export default function MarketStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MarketStatsData | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch('/marketStats.json');
        if (!res.ok) throw new Error('Failed to load market stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error loading market stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="w-full min-h-[180px] bg-zinc-800 border border-zinc-700 rounded-2xl p-4 animate-pulse" />
    );
  }

  return (
    <div className="bg-zinc-800 border h-full border-zinc-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-sm text-white space-y-4 w-full min-h-[180px]">
      <h2 className="text-white text-sm font-semibold mb-2">📊 Market Overview</h2>
      <div className="divide-y h-[90%] flex flex-col justify-center divide-zinc-700">
        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">💰 Total M.Cap</span>
          <span className="font-semibold text-green-400">
            ${stats.totalMarketCap >= 1e12
              ? (stats.totalMarketCap / 1e12).toFixed(2) + ' T'
              : (stats.totalMarketCap / 1e9).toFixed(2) + ' B'}
          </span>
        </div>

        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">📈 BTC Dominance</span>
          <span className="font-semibold text-blue-400">
            {stats.btcDominance.toFixed(2)}%
          </span>
        </div>

        <div className="py-3 px-2 hover:bg-zinc-700/40 rounded-md transition flex justify-between items-center">
          <span className="text-zinc-400">🔄 24h Volume</span>
          <span className="font-semibold text-yellow-400">
            ${(stats.totalVolume / 1e9).toFixed(2)} B
          </span>
        </div>
      </div>
    </div>
  );
}