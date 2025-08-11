'use client';

import { Send } from 'lucide-react';

export default function LinkedAccounts() {
  return (
    <div className="bg-zinc-900 text-white rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-800 p-2 rounded-full">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-white">Telegram</p>
            <p className="text-sm text-zinc-400">Connect to your Telegram with DropsTab account.</p>
          </div>
        </div>
        <button className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-4 rounded">Connect</button>
      </div>
    </div>
  );
}