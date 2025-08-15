"use client";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";

export default function PortfolioSummaryCard({
  initial,
}: {
  initial?: { totalCurrentValue: number; totalProfit: number; percentageChange24h: number };
}) {
  const { summary, loading } = usePortfolioSummary();
  const s = loading && initial ? initial : summary;

  const isProfit = s.totalProfit >= 0;
  const badge = isProfit ? "text-green-400 bg-green-700/30" : "text-red-400 bg-red-700/30";

  return (
    <div className="bg-zinc-800 p-4 rounded-xl text-white space-y-3">
      <div className="text-zinc-400 text-sm">Current Balance</div>
      <div className="text-3xl font-bold">${s.totalCurrentValue.toFixed(2)}</div>
      <div className="text-sm">
        <span className={`${badge} px-2 py-1 rounded-full`}>
          {s.percentageChange24h.toFixed(2)}% / ${s.totalProfit.toFixed(2)}
        </span>
      </div>
    </div>
  );
}