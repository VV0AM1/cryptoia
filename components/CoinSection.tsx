'use client';
import { useState, useEffect } from 'react';
import CoinCard from './CoinCard';
import { useSidebar } from '@/app/context/SidebarContext';

export type Coin = {
  id: string;
  market_cap_rank: number;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d: { price: number[] };
  image: string;
};

export default function CoinSection() {
  const [assets, setAssets] = useState<Coin[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { isOpened } = useSidebar();

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
      fetch('/api/allassets')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
        })
        .then((data) => {
          if (isMounted) {
            setAssets(data.assets); 
            setLoading(false);
            setError('');
          }
        })
        .catch(() => {
          if (isMounted) {
            setError('Error fetching assets');
            setLoading(false);
          }
        });
    };

    fetchData(); 
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval); 
    };
  }, []);


  const marginLeft = isOpened ? 'ml-[300px]' : 'ml-[80px]'; 
  const contentWidth = 'w-[calc(100%-300px)]'; 

  if (loading) return <div className={`w-5/6 ${marginLeft} h-screen flex items-center justify-center`}><p>Loading...</p></div>;
  if (error) return <p>{error}</p>;

    return (
    <div className={`flex flex-col ${marginLeft} ${contentWidth} max-w-6xl bg-zinc-800 p-8 rounded-3xl`}>
        <div className="flex justify-between items-center py-2 text-xs text-zinc-400 border-b border-zinc-600">
            <p className="w-10">#</p>
            <p className="w-40">Asset</p>
            <p className="w-24 text-right">Price</p>
            <p className="w-20 text-right">24h %</p>
            <p className="w-28 text-right">Market Cap</p>
            <p className="w-28 text-right">24h Volume</p>
            <p className="w-32 text-right">7d Chart</p>
        </div>

        {assets.map((coin) => (
        <CoinCard key={coin.id} coin={coin} />
        ))}
    </div>
    );
}
