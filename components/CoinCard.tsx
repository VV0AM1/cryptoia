'use client';

import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
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
    <div className="grid grid-cols-4 md:grid-cols-7 items-center gap-2 sm:gap-4 py-4 border-b border-zinc-700 text-white text-[11px] sm:text-sm">
      <p className="text-zinc-400">{coin.market_cap_rank}</p>

      <div className="flex items-center gap-2">
        <img src={coin.image} className="w-5 h-5 sm:w-6 sm:h-6" alt={coin.symbol} />
        <div>
          <p className="leading-none">{coin.name}</p>
          <p className="text-[10px] text-zinc-400 leading-none">({coin.symbol.toUpperCase()})</p>
        </div>
      </div>

      <p className="text-right">${coin.current_price.toFixed(2)}</p>
      <p className={`text-right ${parseFloat(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change}%
      </p>

      <p className="text-right hidden md:block">{marketCap}</p>
      <p className="text-right hidden md:block">{volume}</p>

      <div className="h-8 hidden md:block">
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