'use client';

import { useSidebar } from '@/app/context/SidebarContext';
import TopGainers from './TopGainers';
import MarketStats from './MarketStats';
import FearIndex from './FearIndex';
import NewActivities from './NewActivities';

export default function HighlightsPanel() {

  const { isOpened } = useSidebar();
  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  return (
    <div className={`grid grid-cols-1  md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 ${marginLeft} ${contentWidth}`}>
    <div className="w-full"><TopGainers /></div>
    <div className="w-full"><MarketStats /></div>
    <div className="w-full"><FearIndex value={68} /></div>
    <div className="w-full"><NewActivities /></div>
    </div>
  );
}
