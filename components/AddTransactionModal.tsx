'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary';

type Props = {
  coin: {
    name: string;
    symbol: string;
    image: string;
    id: string;
    currentPrice: number;
  };
  refetch: () => void;
  onClose: () => void;
  onSubmit: (tx: any) => void;
};

export default function AddTransactionModal({ coin, onClose, onSubmit }: Props) {
  const [type, setType] = useState<'buy' | 'sell' | 'transfer'>('buy');
  const [priceMode, setPriceMode] = useState<'market' | 'custom'>('market');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(coin.currentPrice.toString());
  const [total, setTotal] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const { refetch } = usePortfolioSummary();

  useEffect(() => {
    const a = parseFloat(amount);
    const p = parseFloat(price);
    const t = parseFloat(total);

    if (!isNaN(a) && !isNaN(p) && document.activeElement?.id !== 'total') {
      setTotal((a * p).toFixed(2));
    } else if (!isNaN(t) && !isNaN(p) && document.activeElement?.id === 'total') {
      setAmount((t / p).toString());
    } else if (!isNaN(t) && !isNaN(a) && document.activeElement?.id === 'total') {
      setPrice((t / a).toString());
    }
  }, [amount, price, total]);

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price);
    const parsedTotal = parseFloat(total);

    if (!parsedAmount || parsedAmount <= 0 || !parsedPrice || !parsedTotal) return;

    const tx = {
      type,
      amount: parsedAmount,
      price: parsedPrice,
      total: parsedTotal,
      timestamp: new Date(date).toISOString(),
      coinId: coin.id,
      symbol: coin.symbol,
    };

    try {
      const res = await fetch('/api/portfolio/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add transaction');
      }

      await refetch(); // refetch summary
      onSubmit(data);  // callback to parent
      onClose();       // close modal
    } catch (err) {
      console.error('Error adding transaction:', err);
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
              <span>{coin.symbol.toUpperCase()} {coin.name}</span>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-zinc-400 hover:text-white" />
            </button>
          </div>

          <div className="flex justify-between mb-4 border border-zinc-700 rounded-lg overflow-hidden text-sm font-medium">
            {['buy', 'sell', 'transfer'].map((t) => (
              <button
                key={t}
                onClick={() => setType(t as any)}
                className={`flex-1 py-2 ${type === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded mb-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <label className="block text-sm mb-1">Price</label>
          <div className="flex mb-2">
            <input
              type="number"
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-l"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={priceMode === 'market'}
            />
            <div className="bg-zinc-700 px-3 py-2 rounded-r text-sm">USD</div>
          </div>
          <div className="flex gap-2 mb-3 text-xs">
            <button
              onClick={() => {
                setPriceMode('market');
                setPrice(coin.currentPrice.toString());
              }}
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
            />
            <div className="bg-zinc-700 px-3 py-2 rounded-r text-sm">USD</div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Add Transaction
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}