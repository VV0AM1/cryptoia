// app/not-found.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  HomeIcon,
  RocketLaunchIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const goBack = () => router.back();
  const goMarket = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = q.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!sym) return;
    router.push(`/market/${sym.endsWith('USDT') ? sym : `${sym}USDT`}`);
  };

  return (
    <div className="relative min-h-dvh bg-zinc-900 text-white overflow-hidden">
      <motion.div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.2 }}
        style={{ background: 'radial-gradient(closest-side, rgba(34,197,94,0.35), transparent)' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-48 -left-48 h-[28rem] w-[28rem] rounded-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.2, delay: 0.15 }}
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 md:py-24">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 110, damping: 16 }}
          className="mx-auto w-full rounded-3xl border border-zinc-700/60 bg-zinc-900/70 shadow-[0_0_60px_rgba(34,211,238,0.08)] backdrop-blur-md p-6 md:p-10"
        >
          <div className="flex items-center gap-4">
            <Image
              src="/images/cryptoia-notfound.png"
              alt="CryptoIA"
              width={56}
              height={56}
              className="rounded-xl"
              priority
            />
            <div>
              <p className="text-sm text-zinc-400 tracking-wide">Error 404</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">Page not found</h1>
            </div>
          </div>

          <p className="mt-4 text-zinc-300">
            The route you’re looking for doesn’t exist or moved. Try jumping to a market, head home, or go back.
          </p>

          <form
            onSubmit={goMarket}
            className="mt-6 flex flex-col sm:flex-row gap-3"
            aria-label="Jump to market"
          >
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a symbol (e.g. BTC, ETH, SOL…) — we’ll open the USDT pair"
                className="w-full rounded-2xl bg-zinc-800/70 border border-zinc-700 px-10 py-3 text-sm outline-none
                           placeholder-zinc-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500/90 hover:bg-cyan-400
                         px-5 py-3 text-sm font-semibold text-zinc-900 transition shadow-lg shadow-cyan-500/20"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              Open Market
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800
                         px-4 py-2 text-sm transition"
            >
              <HomeIcon className="w-5 h-5 text-zinc-300" />
              Back to Home
            </Link>
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/70 hover:bg-zinc-800
                         px-4 py-2 text-sm text-zinc-200 transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-zinc-300" />
              Go Back
            </button>
            <Link
              href="/watchlist"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/70 hover:bg-zinc-800
                         px-4 py-2 text-sm text-zinc-200 transition"
            >
              Watchlist
            </Link>
            <Link
              href="/market/BTCUSDT"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700/70 hover:bg-zinc-800
                         px-4 py-2 text-sm text-zinc-200 transition"
            >
              BTC/USDT
            </Link>
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-center text-xs text-zinc-500"
        >
          Tip: type a ticker (e.g., <span className="text-zinc-300">BTC</span>) and hit “Open Market”.
        </motion.p>
      </div>
    </div>
  );
}
