'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
};

type Props = {
  onSelect: (coin: Coin) => void;
  onClose: () => void;
};

export default function AddAssetModal({ onSelect, onClose }: Props) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState('');

    useEffect(() => {
    fetch('/api/allassets')
        .then(res => res.json())
        .then(data => setCoins(data.assets))
        .catch(console.error);
    }, []);

  const filtered = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-zinc-900 w-[400px] rounded-2xl p-4 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Add Asset</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✖</button>
        </div>

        <input
          type="text"
          placeholder="Search for Asset..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-zinc-800 text-white focus:outline-none"
        />

        <div className="space-y-2">
          {filtered.slice(0, 30).map((coin) => (
            <button
              key={coin.id}
              onClick={() => onSelect(coin)}
              className="flex items-center space-x-3 w-full p-2 hover:bg-zinc-800 rounded transition"
            >
              <Image src={coin.image} alt={coin.name} width={24} height={24} />
              <span className="text-white">{coin.symbol.toUpperCase()} <span className="text-zinc-400">{coin.name}</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}