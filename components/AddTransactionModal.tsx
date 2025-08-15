'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary';

type Props = {
  coin: {
    id: string;         
    symbol: string;    
    name: string;
    image: string;
    currentPrice: number;
  };
  onClose: () => void;
  onSubmit: (tx?: any) => void;
};

type HoldingRow = {
  symbol: string;          
  coinId?: string;         
  quantity: number;
};

export default function AddTransactionModal({ coin, onClose, onSubmit }: Props) {
  const [type, setType] = useState<'buy' | 'sell' | 'transfer'>('buy');
  const [priceMode, setPriceMode] = useState<'market' | 'custom'>('market');

  const [amount, setAmount] = useState('');      
  const [price, setPrice] = useState(String(coin.currentPrice));
  const [total, setTotal] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [submitting, setSubmitting] = useState(false);

  const { refetch } = usePortfolioSummary();

  const [holdingQty, setHoldingQty] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/portfolio/coins', { cache: 'no-store' });
        const rows: HoldingRow[] = await r.json();
        const up = (s?: string) => (s || '').toUpperCase().trim();

        const match =
          rows.find((c) => up(c.symbol) === up(coin.id)) ||              
          rows.find((c) => up(c.coinId) === up(coin.id)) ||          
          rows.find((c) => up(c.symbol) === up(`${coin.symbol}USDT`)) || 
          rows.find((c) => up(c.symbol) === up(coin.symbol)) ||
          rows.find((c) => up(c.coinId) === up(coin.symbol));

        if (alive) setHoldingQty(Number(match?.quantity || 0));
      } catch {
        if (alive) setHoldingQty(0);
      }
    })();
    return () => { alive = false; };
  }, [coin.id, coin.symbol]);

  useEffect(() => {
    const a = parseFloat(amount.replace(',', '.'));
    const p = parseFloat(price.replace(',', '.'));
    const t = parseFloat(total.replace(',', '.'));

    if (!Number.isNaN(a) && !Number.isNaN(p) && (document.activeElement as HTMLElement)?.id !== 'total') {
      setTotal((a * p).toFixed(2));
    }
    else if (!Number.isNaN(t) && !Number.isNaN(p) && (document.activeElement as HTMLElement)?.id === 'total') {
      setAmount(p > 0 ? String(t / p) : amount);
    }
  }, [amount, price, total]);

  const parsedAmount = useMemo(() => parseFloat(amount.replace(',', '.')) || 0, [amount]);
  const parsedPrice  = useMemo(() => parseFloat(price.replace(',', '.'))  || 0, [price]);
  const parsedTotal  = useMemo(() => parseFloat(total.replace(',', '.'))  || 0, [total]);

  const sellTooMuch = type === 'sell' && parsedAmount > holdingQty + 1e-12;
  const canSubmit =
    !submitting &&
    parsedAmount > 0 &&
    parsedPrice > 0 &&
    parsedTotal > 0 &&
    !(type === 'sell' && sellTooMuch);

  const fillMax = () => setAmount(holdingQty.toString());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const tx = {
        type,
        amount: parsedAmount,
        price: parsedPrice,
        total: parsedTotal,
        timestamp: new Date(date).toISOString(),
        symbol: coin.id,        
        coinId: coin.id,       
      };

      const res = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to add transaction');

      await refetch();
      onSubmit(json);
      onClose();
    } catch (e) {
      console.error('Error adding transaction:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-zinc-900 text-white w-[360px] rounded-2xl p-5 relative shadow-lg"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Image src={coin.image} alt={coin.name} width={28} height={28} />
              <span>{coin.symbol.toUpperCase()} <span className="text-zinc-400">({coin.name})</span></span>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
          </div>

          <div className="flex justify-between mb-4 border border-zinc-700 rounded-lg overflow-hidden text-sm font-medium">
            {(['buy', 'sell', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 ${type === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-300'}`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <label className="block text-sm mb-1">Amount</label>
            {type === 'sell' && (
              <div className="text-xs text-zinc-400">
                Max: {holdingQty.toFixed(8)}{' '}
                <button onClick={fillMax} className="text-blue-400 hover:underline ml-1">MAX</button>
              </div>
            )}
          </div>
          <input
            type="number"
            id="amount"
            className={`w-full px-3 py-2 bg-zinc-800 border ${sellTooMuch ? 'border-red-500' : 'border-zinc-700'} rounded mb-1`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="any"
          />
          {sellTooMuch && (
            <p className="text-xs text-red-400 mb-2">
              Too much. You have {holdingQty.toFixed(8)} {coin.symbol.toUpperCase()}.
            </p>
          )}

          <label className="block text-sm mb-1 mt-2">Price</label>
          <div className="flex mb-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceMode === 'market'}
              min="0"
              step="any"
            />
            <div className="bg-zinc-700 px-3 py-2 rounded-r text-sm">USD</div>
          </div>
          <div className="flex gap-2 mb-3 text-xs">
            <button
              onClick={() => { setPriceMode('market'); setPrice(String(coin.currentPrice)); }}
              className={`px-3 py-1 rounded-full ${priceMode === 'market' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}
            >
              Market Price
            </button>
            <button
              onClick={() => setPriceMode('custom')}
              className={`px-3 py-1 rounded-full ${priceMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-zinc-700 text-zinc-300'}`}
            >
              Custom Price
            </button>
          </div>

          <label className="block text-sm mb-1">Date & Time</label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded mb-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="block text-sm mb-1">Total</label>
          <div className="flex mb-4">
            <input
              id="total"
              type="number"
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              min="0"
              step="any"
            />
            <div className="bg-zinc-700 px-3 py-2 rounded-r text-sm">USD</div>
          </div>

          <button
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full bg-blue-600 disabled:bg-blue-600/60 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {submitting ? 'Saving…' : 'Add Transaction'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}