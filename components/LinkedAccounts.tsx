'use client';

import { Send, Github, Mail } from 'lucide-react';

export default function LinkedAccounts() {
  const items = [
    {
      name: 'Telegram',
      icon: Send,
      desc: 'Connect to your Telegram to receive alerts.',
      action: 'Connect',
    },
    {
      name: 'GitHub',
      icon: Github,
      desc: 'Link GitHub to show contributions.',
      action: 'Connect',
    },
    {
      name: 'Email Alerts',
      icon: Mail,
      desc: 'Get daily/weekly summaries to your inbox.',
      action: 'Configure',
    },
  ];

  return (
    <section className="bg-zinc-800 text-white rounded-2xl p-4 sm:p-6 border border-zinc-700">
      <h2 className="text-xl font-semibold mb-4">Linked Accounts</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.name} className="bg-zinc-900/40 border border-zinc-700 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-zinc-800 p-2 rounded-full">
                <it.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-sm text-zinc-400">{it.desc}</p>
              </div>
            </div>
            <button className="bg-zinc-700 hover:bg-zinc-600 text-white py-1 px-4 rounded text-sm">{it.action}</button>
          </div>
        ))}
      </div>
    </section>
  );
}