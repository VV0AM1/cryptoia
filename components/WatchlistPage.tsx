'use client';

import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import { useSidebar } from '@/app/context/SidebarContext';

type Row = {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
};

export default function WatchlistPage({ initial = [] as Row[] }: { initial?: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [loading, setLoading] = useState(initial.length === 0);
  const [err, setErr] = useState('');
  const { isOpened } = useSidebar();

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const res = await fetch('/api/watchlist/full', { cache: 'no-store' });
        const json = await res.json();
        if (alive) {
          setRows(Array.isArray(json.assets) ? json.assets : []);
          setErr('');
        }
      } catch (e: any) {
        if (alive) setErr(e?.message || 'Failed to load');
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    const id = setInterval(run, 30_000);
    return () => { alive = false; clearInterval(id); };
  }, []);

    const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
    const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  return (
    <div className={`px-4 sm:px-6 md:px-8 lg:px-12 py-8 ${marginLeft} ${contentWidth}`}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Cryptocurrency Watchlist</h1>
      </div>

      <div className="bg-zinc-800 rounded-3xl p-4 sm:p-6 border border-zinc-700">
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-4 items-center text-xs text-zinc-400 border-b border-zinc-700 pb-2">
          <p className="hidden sm:block">#</p>
          <p>Asset</p>
          <p className="text-right">Price</p>
          <p className="text-right">24h %</p>
          <p className="text-right">7d %</p>
          <p className="text-right">Market Cap</p>
          <p className="text-right hidden sm:block">24h Volume</p>
          <p className="text-right hidden sm:block">7d Chart</p>
        </div>

        {loading ? (
          <div className="mt-4 space-y-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 sm:grid-cols-9 gap-4 items-center py-4 border-b border-zinc-700/60">
                <div className="hidden sm:block h-4 w-8 bg-zinc-700 rounded" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-700" />
                  <div className="h-3 w-24 bg-zinc-700 rounded" />
                </div>
                <div className="h-3 w-16 bg-zinc-700 rounded justify-self-end" />
                <div className="h-3 w-12 bg-zinc-700 rounded justify-self-end" />
                <div className="h-3 w-12 bg-zinc-700 rounded justify-self-end" />
                <div className="h-3 w-20 bg-zinc-700 rounded justify-self-end" />
                <div className="h-3 w-20 bg-zinc-700 rounded justify-self-end hidden sm:block" />
                <div className="h-6 w-full bg-zinc-700 rounded hidden sm:block" />
              </div>
            ))}
          </div>
        ) : err ? (
          <div className="p-6 text-red-400 text-sm">{err}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-zinc-400 text-sm">Your watchlist is empty. Add assets using the ⭐ icons.</div>
        ) : (
          <div className="divide-y divide-zinc-700 mt-2">
            {rows.map((c) => {
              const history = c.sparkline_in_7d?.price?.map((p, i) => ({ t: i, v: p })) ?? [{ t: 0, v: c.current_price }];
              const ch24 = c.price_change_percentage_24h ?? 0;
              const ch7 = c.price_change_percentage_7d_in_currency ?? 0;
              const color24 = ch24 >= 0 ? 'text-green-400' : 'text-red-400';
              const color7 = ch7 >= 0 ? 'text-green-400' : 'text-red-400';
              const price = `$${c.current_price.toLocaleString(undefined, { maximumFractionDigits: 8 })}`;
              const cap = c.market_cap > 1e9 ? `$${(c.market_cap / 1e9).toFixed(2)} B` : `$${(c.market_cap / 1e6).toFixed(2)} M`;
              const vol = c.total_volume > 1e9 ? `$${(c.total_volume / 1e9).toFixed(2)} B` : `$${(c.total_volume / 1e6).toFixed(2)} M`;

              return (
                <div key={c.id} className="grid grid-cols-6 sm:grid-cols-9 gap-4 items-center py-4">
                  <div className="hidden sm:flex items-center text-zinc-400">
                    <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-full bg-zinc-700/60 text-xs">
                      {c.market_cap_rank || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />
                    <div className="leading-tight">
                      <div className="text-white font-medium">{c.symbol.toUpperCase()}</div>
                      <div className="text-[11px] text-zinc-400">{c.name}</div>
                    </div>
                  </div>

                  <div className="text-right text-sky-300">{price}</div>
                  <div className={`text-right ${color24}`}>{ch24.toFixed(2)}%</div>
                  <div className={`text-right ${color7}`}>{ch7.toFixed(2)}%</div>
                  <div className="text-right text-zinc-300">{cap}</div>
                  <div className="text-right text-zinc-300 hidden sm:block">{vol}</div>

                  <div className="h-8 w-full hidden sm:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <YAxis domain={['dataMin', 'dataMax']} hide />
                        <Line type="monotone" dataKey="v" stroke={ch24 >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}