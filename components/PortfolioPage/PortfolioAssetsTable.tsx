"use client";
import { useEffect, useState } from "react";

type Coin = {
  symbol: string; name: string; image: string;
  currentPrice: number; priceChangePercentage24h: number;
  totalInvested: number; averagePrice: number; quantity: number;
};

export default function PortfolioAssetsTable({ initial }: { initial?: Coin[] }) {
  const [coins, setCoins] = useState<Coin[]>(initial ?? []);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch("/api/portfolio/coins", { cache: "no-store" });
        const data = await res.json();
        setCoins(data);
      } catch (err) {
        console.error("Failed to load coins", err);
      } finally {
        setLoading(false);
      }
    };
    if (!initial) fetchCoins();
  }, [initial]);

  return (
    <div className="bg-zinc-800 p-6 rounded-xl text-white">
      <h2 className="text-lg font-semibold mb-4">Your Assets</h2>
      {loading ? (
        <div className="text-zinc-400">Loading...</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="text-left px-2 py-2">Asset</th>
              <th className="text-right px-2">Price</th>
              <th className="text-right px-2">24h %</th>
              <th className="text-right px-2">Invested</th>
              <th className="text-right px-2">Avg Price</th>
              <th className="text-right px-2">P/L</th>
              <th className="text-right px-2">Holdings</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => (
              <tr key={coin.symbol} className="border-t border-zinc-700">
                <td className="flex items-center gap-2 py-2 px-2">
                  <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                  {coin.name}
                </td>
                <td className="text-right px-2">${coin.currentPrice.toFixed(4)}</td>
                <td className={`text-right px-2 ${coin.priceChangePercentage24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.priceChangePercentage24h.toFixed(2)}%
                </td>
                <td className="text-right px-2">${coin.totalInvested.toFixed(2)}</td>
                <td className="text-right px-2">${coin.averagePrice.toFixed(4)}</td>
                <td className="text-right px-2">${(coin.currentPrice * coin.quantity - coin.totalInvested).toFixed(2)}</td>
                <td className="text-right px-2">{coin.quantity.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}