'use client';
import { useEffect, useState } from 'react';

export default function FearIndex({ value }: { value: number }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="w-full min-h-[180px] bg-zinc-800 border border-zinc-700 rounded-2xl p-4 animate-pulse" />;
  }

  const sentiment = value > 75 ? 'Extreme Greed' : value > 50 ? 'Greed' : value > 25 ? 'Fear' : 'Extreme Fear';
  const sentimentColor = value > 50 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-zinc-800 border h-full border-zinc-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-white text-sm space-y-2 w-full min-h-[180px]">
      <div className="flex items-center gap-2 text-sm font-semibold mb-2">
        <span className="text-blue-400">📊</span>
        <span>Fear Index</span>
      </div>
      <div className={`text-4xl font-bold mt-1 mb-8 ${sentimentColor}`}>{value}</div>
      <p className={`text-sm ${sentimentColor}`}>Current sentiment: <span className="font-medium">{sentiment}</span></p>
      <div className="mt-2 space-y-1 text-xs text-zinc-400">
        <p>📅 Last update: 3h ago</p>
        <p>🕒 Previous: 68 (7d ago)</p>
        <p>📈 Trend: Stable</p>
      </div>
    </div>
  );
}