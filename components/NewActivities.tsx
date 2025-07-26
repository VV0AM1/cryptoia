'use client';
import { useEffect, useState } from 'react';

export default function NewActivities() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <div className="w-full min-h-[180px] bg-zinc-800 border border-zinc-700 rounded-2xl p-4 animate-pulse" />;

  return (
    <div className="bg-zinc-800 border h-full border-zinc-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-white text-sm space-y-3 w-full min-h-[180px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold flex items-center gap-1">
          <span className="text-blue-400">🆕</span> New Activities
        </h2>
        <button className="text-xs text-blue-400 hover:underline">See More</button>
      </div>
      <div className="space-y-2">
        <div className="bg-zinc-700/30 p-3 rounded-xl hover:bg-zinc-700/50 transition">
          <p className="font-semibold">COGNI</p>
          <p className="text-xs text-zinc-400">COGNI AI - Public Sale</p>
          <div className="text-xs text-zinc-500 mt-1">Investors: Coming Soon</div>
        </div>
        <div className="bg-zinc-700/30 p-3 rounded-xl hover:bg-zinc-700/50 transition">
          <p className="font-semibold">D3</p>
          <p className="text-xs text-zinc-400">Testnet • Raised: <span className="text-yellow-400 font-medium">$30.00M</span></p>
          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
            <span>🔗 Website</span>
            <span>📄 Docs</span>
            <span>💬 Community</span>
          </div>
        </div>
      </div>
    </div>
  );
}