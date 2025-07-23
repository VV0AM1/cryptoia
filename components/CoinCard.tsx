'use client';


import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { Coin } from './CoinSection';

type Props = {
  coin: Coin;
};



export default function CoinCard({ coin }: Props) {
  const history = coin.sparkline_in_7d.price.map((price, i) => ({
    time: i,
    priceUsd: price,
  }));

  const price = coin.current_price.toFixed(2);
  const change = coin.price_change_percentage_24h.toFixed(2);
  const marketCap = (coin.market_cap / 1e9).toFixed(2) + ' B';
  const volume = (coin.total_volume / 1e9).toFixed(2) + ' B';
  const changeColor = parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="flex justify-between items-center py-4 border-b border-zinc-700 text-white text-sm">
      <p className="w-10 text-zinc-400">{coin.market_cap_rank}</p>

      <div className="w-40 flex items-center gap-2">
        <img src={coin.image} className="w-6 h-6" alt={coin.symbol} />
        <div>
          <span>{coin.name}</span>
          <div className="text-xs text-zinc-400">({coin.symbol.toUpperCase()})</div>
        </div>
      </div>

      <p className="w-24 text-right">${price}</p>
      <p className={`w-20 text-right ${changeColor}`}>{change}%</p>
      <p className="w-28 text-right">{marketCap}</p>
      <p className="w-28 text-right">{volume}</p>

      <div className="w-32 h-10 ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line
              type="monotone"
              dataKey="priceUsd"
              stroke={parseFloat(change) >= 0 ? '#4ade80' : '#f87171'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}