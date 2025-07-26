'use client';

import { useState } from 'react';
import CoinSection from '@/components/CoinSection';
import HighlightsPanel from '@/components/HighlightsPanel';
import HighlightsToggle from '@/components/HighlightsToggle';

export default function Home() {
  const [showHighlights, setShowHighlights] = useState(true);

  return (
    <div className="w-full min-h-screen bg-zinc-900 flex flex-col items-center px-2 sm:px-6 py-12">
      <div className="w-full sm:px-12 md:px-24">
        <HighlightsToggle onToggle={setShowHighlights} />
        {showHighlights && <HighlightsPanel />}
        <CoinSection />
      </div>
    </div>
  );
}