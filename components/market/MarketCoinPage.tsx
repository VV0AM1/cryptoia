"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip, XAxis, Area, AreaChart } from "recharts";
import { useSidebar } from '@/app/context/SidebarContext';

type Initial = {
  symbol: string;
  name: string;
  image: string;
  lastPrice: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;       
  quoteVolume: number;  
  chart: { t: number; o: number; h: number; l: number; c: number; v: number }[];
};

export default function MarketCoinPage({ initial }: { initial: Initial }) {
  const [price, setPrice] = useState(initial.lastPrice);
  const [change, setChange] = useState(initial.priceChangePercent);
  const [vol, setVol] = useState(initial.quoteVolume);
  const [chart, setChart] = useState(initial.chart);
  const { isOpened } = useSidebar();

  useEffect(() => {
    let alive = true;
    const hit = async () => {
      try {
        const r = await fetch(`/api/market/ticker24h?symbols=${initial.symbol}`, { cache: "no-store" });
        const rows = await r.json();
        const t = Array.isArray(rows) ? rows[0] : null;
        if (t && alive) {
          setPrice(Number(t.lastPrice ?? price));
          setChange(Number(t.priceChangePercent ?? change));
          setVol(Number(t.quoteVolume ?? vol));
        }
      } catch {}
    };
    hit();
    const id = setInterval(hit, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [initial.symbol]);

  const data = useMemo(
    () => chart.map(p => ({ x: new Date(p.t).toLocaleDateString(), c: p.c })),
    [chart]
  );

  const pos = change >= 0;
  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  return (
    <div className={` ${marginLeft} ${contentWidth} min-h-screen bg-zinc-900 text-white px-4 sm:px-6 md:px-8 py-6`}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img src={initial.image} alt={initial.name} className="w-8 h-8 rounded-full" />
          <div>
            <div className="text-xl font-bold">{initial.name}</div>
            <div className="text-xs text-zinc-400">{initial.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}</div>
          <div className={pos ? "text-green-400" : "text-red-400"}>{change.toFixed(2)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-zinc-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-zinc-400 text-sm">Price</div>
            <div className="text-zinc-400 text-sm">24h</div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="x" hide />
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
                <Area dataKey="c" stroke={pos ? "#22c55e" : "#ef4444"} fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="lg:col-span-4 bg-zinc-800 rounded-2xl p-4 space-y-3">
          <h3 className="font-semibold">Statistics (24h)</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="High" value={`$${initial.highPrice.toLocaleString()}`} />
            <Stat label="Low" value={`$${initial.lowPrice.toLocaleString()}`} />
            <Stat label="Volume (Quote)" value={`$${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
            <Stat label="Volume (Base)" value={initial.volume.toLocaleString()} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-zinc-700/50">
            <Stat label="Market Cap" value="—" />
            <Stat label="FDV" value="—" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900/60 rounded-xl p-3">
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}