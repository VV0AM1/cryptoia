'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import PortfolioSummaryCard from './PortfolioSummaryCard';
import PortfolioChart from './PortfolioChart';
import PortfolioAssetsTable from './PortfolioAssetsTable';
import PortfolioNotes from './PortfolioNotes';
import PortfolioTransactions from './PortfolioTransactions';



type Summary = { totalCurrentValue: number; totalProfit: number; percentageChange24h: number };
type Coin = {
  symbol: string; name: string; image: string;
  currentPrice: number; priceChangePercentage24h: number;
  totalInvested: number; averagePrice: number; quantity: number;
};
type Tx = {
  _id: string; type: string; symbol: string;
  price: number; quantity: number; total: number; timestamp: string | null;
};

export default function PortfolioScreen({
  initialSummary,
  initialCoins,
  initialTransactions,
}: {
  initialSummary: Summary;
  initialCoins: Coin[];
  initialTransactions: Tx[];
}) {
  const { isOpened } = useSidebar();
  const ml = isOpened ? "md:ml-[300px]" : "md:ml-[190px]";
  const cw = "w-full lg:w-[calc(100%-300px)]";

  return (
    <div className={`bg-zinc-900 h-full p-6 space-y-6 ${ml} ${cw}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <PortfolioSummaryCard initial={initialSummary} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <PortfolioChart initial={initialTransactions} />
        </div>
      </div>

      <PortfolioTransactions initial={initialTransactions} />
      <PortfolioAssetsTable initial={initialCoins} />
    </div>
  );
}