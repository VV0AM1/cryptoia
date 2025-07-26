'use client';
import { useState } from 'react';

export default function HighlightsToggle({ onToggle }: { onToggle: (val: boolean) => void }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="flex items-center justify-end mb-4">
      <label className="inline-flex items-center cursor-pointer gap-2">
        <span className="text-sm text-white">Highlights</span>
        <div className="relative">
          <input
            type="checkbox"
            checked={enabled}
            onChange={() => {
              setEnabled(!enabled);
              onToggle(!enabled);
            }}
            className="sr-only"
          />
          <div className={`block w-12 h-6 rounded-full transition-colors duration-300 ${enabled ? 'bg-blue-500' : 'bg-zinc-600'}`} />
          <div
            className={`dot absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
              enabled ? 'translate-x-6' : ''
            }`}
          />
        </div>
      </label>
    </div>
  );
}