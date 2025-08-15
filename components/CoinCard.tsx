'use client';

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Coin } from './CoinSection';
import type { ICoin } from '@/models/Coin'; 


type Props = {
  coin: Coin;
  onUpdate?: () => void;
};

export default function CoinCard({ coin, onUpdate }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const checkWatchlist = async () => {
      try {
        const res = await fetch('/api/watchlist');
        const list = await res.json();
        if (!ignore) {
          const isFavorited = Array.isArray(list) && list.some((c: Coin) => c.symbol === coin.symbol);
          setFavorited(isFavorited);
        }
      } catch (e) {
        console.error('Failed to fetch watchlist', e);
      }
    };
    checkWatchlist();
    return () => { ignore = true; };
  }, [coin.symbol]);

  const history = useMemo(
    () =>
      coin.sparkline_in_7d?.price?.map((p, i) => ({ time: i, priceUsd: p })) ??
      [{ time: 0, priceUsd: coin.current_price }],
    [coin.sparkline_in_7d?.price, coin.current_price]
  );

  const change24h = coin.price_change_percentage_24h ?? 0;
  const change7d = coin.price_change_percentage_7d_in_currency ?? 0;

  const changeColor24h = change24h >= 0 ? 'text-green-400' : 'text-red-400';
  const changeColor7d = change7d >= 0 ? 'text-green-400' : 'text-red-400';

  const marketCap = `${(coin.market_cap / 1e9).toFixed(2)} B`;
  const volume = `${(coin.total_volume / 1e9).toFixed(2)} B`;

  const handleFavoriteToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const method = favorited ? 'DELETE' : 'POST';

      // ✅ Fully typed ICoin object
      const coinData: ICoin = {
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        totalInvested: 0,
        averagePrice: 0,
        quantity: 0
      };

      const res = await fetch('/api/watchlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coin: coinData }),
      });

      if (!res.ok) throw new Error('Failed to update watchlist');

      setFavorited(!favorited);
      onUpdate?.();
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-9 gap-4 items-center text-white text-sm py-4 border-b border-zinc-700">
      {/* ⭐ */}
      <motion.button
        onClick={handleFavoriteToggle}
        whileTap={{ scale: 1.25, rotate: 10 }}
        animate={{ scale: favorited ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        className="text-zinc-400 hidden sm:block hover:text-yellow-400 transition-colors disabled:opacity-50"
        disabled={loading}
        aria-label={favorited ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Star
          className="w-5 h-5"
          fill={favorited ? '#facc15' : 'none'}
          stroke={favorited ? '#facc15' : 'currentColor'}
        />
      </motion.button>

      {/* Asset */}
      <div className="flex items-center gap-2">
        <img src={coin.image} className="w-5 h-5 sm:w-6 sm:h-6" alt={coin.symbol} />
        <div>
          <p className="leading-none">{coin.name}</p>
          <p className="text-[10px] text-zinc-400 leading-none">({coin.symbol.toUpperCase()})</p>
        </div>
      </div>

      {/* Price (visible on mobile + desktop) */}
      <p className="text-right">${coin.current_price.toFixed(2)}</p>

      {/* 24h % */}
      <p className={`text-right ${changeColor24h}`}>{change24h.toFixed(2)}%</p>

      {/* 7d % */}
      <p className={`text-right ${changeColor7d}`}>{change7d.toFixed(2)}%</p>

      {/* Market Cap */}
      <p className="text-right">{marketCap}</p>

      {/* 24h Volume (desktop only) */}
      <p className="text-right hidden sm:block">{volume}</p>

      {/* 7d Chart (desktop only) */}
      <div className="h-8 ml-8 w-full hidden sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Line
              type="monotone"
              dataKey="priceUsd"
              stroke={change24h >= 0 ? '#4ade80' : '#f87171'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}