'use client';

import { useState } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { Coin } from './CoinSection';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  coin: Coin;
};

export default function CoinCard({ coin }: Props) {
  const [favorited, setFavorited] = useState(false);

  const history = coin.sparkline_in_7d.price.map((price, i) => ({
    time: i,
    priceUsd: price,
  }));

  const change24h = coin.price_change_percentage_24h.toFixed(2);
  const change7d = coin.price_change_percentage_7d_in_currency?.toFixed(2) ?? '0.00';

  const changeColor24h = parseFloat(change24h) >= 0 ? 'text-green-400' : 'text-red-400';
  const changeColor7d = parseFloat(change7d) >= 0 ? 'text-green-400' : 'text-red-400';

  const marketCap = (coin.market_cap / 1e9).toFixed(2) + ' B';
  const volume = (coin.total_volume / 1e9).toFixed(2) + ' B';

  return (
  <div className="grid grid-cols-9 gap-4 items-center text-white text-sm py-4 border-b border-zinc-700">
     <p className="text-zinc-400">{coin.market_cap_rank}</p>
      <motion.button
        onClick={() => setFavorited((prev) => !prev)}
        whileTap={{ scale: 1.3, rotate: 20 }}
        animate={{ scale: favorited ? 1.1 : 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-zinc-400 hover:text-yellow-400 transition-colors"
      >
        <Star
          className="w-5 h-5"
          fill={favorited ? '#facc15' : 'none'}
          stroke={favorited ? '#facc15' : 'currentColor'}
        />
      </motion.button>

      <div className="flex items-center gap-2">
        <img src={coin.image} className="w-5 h-5 sm:w-6 sm:h-6" alt={coin.symbol} />
        <div>
          <p className="leading-none">{coin.name}</p>
          <p className="text-[10px] text-zinc-400 leading-none">({coin.symbol.toUpperCase()})</p>
        </div>
      </div>

      <p className="text-right">${coin.current_price.toFixed(2)}</p>
      <p className={`text-right ${changeColor24h}`}>{change24h}%</p>
      <p className={`text-right ${changeColor7d}`}>{change7d}%</p>
      <p className="text-right">{marketCap}</p>
      <p className="text-right">{volume}</p>

      <div className="h-8 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line
              type="monotone"
              dataKey="priceUsd"
              stroke={parseFloat(change24h) >= 0 ? '#4ade80' : '#f87171'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}