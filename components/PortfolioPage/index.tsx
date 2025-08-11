'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import PortfolioSummaryCard from './PortfolioSummaryCard';
import PortfolioChart from './PortfolioChart';
import PortfolioAssetsTable from './PortfolioAssetsTable';
import PortfolioNotes from './PortfolioNotes';
import PortfolioTransactions from './PortfolioTransactions';

export default function PortfolioPage() {
  const { isOpened } = useSidebar();

  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  return (
    <div className={`bg-zinc-900 p-6 space-y-6 ${marginLeft} ${contentWidth}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <PortfolioSummaryCard />
          <PortfolioNotes />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <PortfolioChart />
        </div>
      </div>

      <PortfolioTransactions />
      <PortfolioAssetsTable />
    </div>
  );
}