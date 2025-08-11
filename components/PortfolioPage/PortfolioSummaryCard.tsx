'use client';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary';

export default function PortfolioSummaryCard() {
  const { summary, loading } = usePortfolioSummary(); // local state

  const isProfit = summary.totalProfit >= 0;
  const profitColor = isProfit ? 'text-green-400 bg-green-700/30' : 'text-red-400 bg-red-700/30';

  return (
    <div className="bg-zinc-800 p-4 rounded-xl text-white space-y-3">
      <div className="text-zinc-400 text-sm">Current Balance</div>
      <div className="text-3xl font-bold">
        {loading ? 'Loading...' : `$${summary.totalCurrentValue.toFixed(2)}`}
      </div>
      <div className="text-sm">
        <span className={`${profitColor} px-2 py-1 rounded-full`}>
          {summary.percentageChange24h.toFixed(2)}% / ${summary.totalProfit.toFixed(2)}
        </span>
      </div>
    </div>
  );
}