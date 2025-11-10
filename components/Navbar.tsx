'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/app/context/SidebarContext';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary';
import AddAssetModal from '@/components/AddAssetModal';
import AddTransactionModal from '@/components/AddTransactionModal';
import ConverterModal from '@/components/ConverterModal';

import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  StarIcon as StarSolid,
} from '@heroicons/react/24/solid';
import {
  PlusCircleIcon,
  UserCircleIcon,
  StarIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';

type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

type SelectedCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
};

const BINANCE_SYMBOL_OVERRIDES: Record<string, string> = {

};

function toBinancePair(sym: string) {
  const base = (BINANCE_SYMBOL_OVERRIDES[sym.toUpperCase()] ?? sym.toUpperCase()).replace(/[^A-Z0-9]/g, '');
  return `${base}USDT`;
}

export default function NavBar() {
  const router = useRouter();
  const { isOpened } = useSidebar();
  const { data: session } = useSession();
  const { summary, loading, refetch } = usePortfolioSummary();

  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [query, setQuery] = useState('');

  const [assets, setAssets] = useState<MarketCoin[]>([]);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<SelectedCoin | null>(null);

  const desktopPadding = isOpened ? 'lg:pl-[320px]' : 'lg:pl-[100px]';
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U';

  const formattedValue = `$${(summary.totalCurrentValue ?? 0).toFixed(2)}`;
  const profit = (summary.totalProfit ?? 0).toFixed(2);
  const percent = (summary.percentageChange24h ?? 0).toFixed(2);
  const isProfit = (summary.totalProfit ?? 0) >= 0;
  const profitColor = isProfit ? 'text-green-400 bg-green-700/30' : 'text-red-400 bg-red-700/30';

  useEffect(() => {
    if (!searchOpen) return;
    let live = true;
    (async () => {
      try {
        const r = await fetch('/api/market/converter', { cache: 'no-store' });
        const j = await r.json();
        if (!live) return;
        const mapped: MarketCoin[] = (j.coins ?? []).map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          image: c.image,
          current_price: Number(c.priceUSDT ?? 0),
          price_change_percentage_24h: Number(c.change24h ?? 0),
        }));
        setAssets(mapped);
      } catch {
        if (live) setAssets([]);
      }
    })();
    return () => {
      live = false;
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const h = setTimeout(async () => {
      const q = query.trim();
      const url = q
        ? `/api/market/converter?q=${encodeURIComponent(q)}&limit=10`
        : '/api/market/converter';
      try {
        const r = await fetch(url, { cache: 'no-store' });
        const j = await r.json();
        const mapped: MarketCoin[] = (j.coins ?? []).map((c: any) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          image: c.image,
          current_price: Number(c.priceUSDT ?? 0),
          price_change_percentage_24h: Number(c.change24h ?? 0),
        }));
        setAssets(mapped);
      } catch {
      }
    }, 250);
    return () => clearTimeout(h);
  }, [searchOpen, query]);

  const trending = useMemo(() => assets.slice(0, 5), [assets]);
  const results = useMemo(() => assets.slice(0, 10), [assets]);

  const handleAddClick = () => setShowAddAsset(true);

  const handleCoinSelect = async (coinLike: { id: string }) => {
    try {
      const res = await fetch(`/api/market/coin/${coinLike.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to load coin');
      setSelectedCoin({
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image,
        currentPrice: data.currentPrice,
      });
      setSearchOpen(false);
      setMenuOpen(false);
    } catch (err) {
      console.error('Failed to fetch price:', err);
    }
  };

  const handleSearchSelect = (c: MarketCoin) => {
    const pair = toBinancePair(c.symbol);
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(`/market/${pair}`);
  };

  const handleTransactionComplete = () => {
    setSelectedCoin(null);
    refetch();
  };

  return (
    <>
      <nav
        className={`fixed top-0 z-40 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between w-full ${desktopPadding}`}
      >
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/crypto_logo.png" alt="logo" width={32} height={32} />
            <span className="hidden sm:inline text-white font-extrabold text-lg">CryptoIA</span>
          </Link>

          <button
            onClick={() => {
              setSearchOpen(true);
              setMenuOpen(false);
              setPortfolioDropdownOpen(false);
              setAvatarDropdownOpen(false);
            }}
            className="hidden sm:flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-left text-sm text-zinc-300 px-3 py-2 rounded-full w-[220px] md:w-[320px] focus:outline-none"
            aria-label="Search coins"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />
            <span className="truncate">Search Coin, CA, Fund or Category</span>
          </button>

          <button
            onClick={() => setConverterOpen(true)}
            className="hidden sm:flex items-center justify-center text-zinc-300 bg-zinc-700 hover:bg-zinc-600 rounded-full w-9 h-9"
            aria-label="Open converter"
            title="Converter"
          >
            <CalculatorIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          {session?.user ? (
            <>
              <Link
                href="/watchlist"
                className="inline-flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm transition"
              >
                <StarSolid className="h-4 w-4 text-yellow-400" />
                <span>Watchlist</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setPortfolioDropdownOpen((v) => !v)}
                  className="bg-zinc-700 text-white rounded-full flex items-center px-3 py-1.5 gap-2 text-sm shadow-sm hover:shadow-md transition"
                >
                  <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center font-semibold text-white">
                    {userInitial}
                  </div>
                  <span>{formattedValue}</span>
                  <span className={`${profitColor} px-2 py-0.5 rounded text-xs`}>${profit}</span>
                  <span className="text-sm text-zinc-400">▾</span>
                </button>

                <AnimatePresence>
                  {portfolioDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-72 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-xl p-4 z-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center font-semibold text-white">
                            {userInitial}
                          </div>
                          <span className="text-white font-medium text-sm">Main</span>
                          <span className="text-zinc-400 text-xs">▾</span>
                        </div>
                        <button onClick={handleAddClick} className="text-zinc-400 hover:text-white" title="Add Asset">
                          <PlusCircleIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-2xl font-semibold text-white">
                        {loading ? 'Loading…' : formattedValue}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`${profitColor} px-2 py-0.5 rounded text-sm font-medium`}>
                          {isProfit ? '+' : '-'}
                          {percent}%
                        </span>
                        <span className={`${isProfit ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
                          ${profit}
                        </span>
                        <span className="text-zinc-400 text-xs">24h</span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleAddClick}
                          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm transition"
                        >
                          ➕ Add Asset
                        </button>
                        <Link
                          href="/portfolio"
                          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm text-center transition"
                        >
                          📂 Open Portfolio
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => setAvatarDropdownOpen((v) => !v)}
                  className="w-9 h-9 rounded-full border-2 border-blue-500 flex items-center justify-center"
                >
                  <UserCircleIcon className="text-white w-6 h-6" />
                </button>

                <AnimatePresence>
                  {avatarDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-4 z-50"
                    >
                      <div className="mb-3 text-sm text-white">
                        <div className="font-semibold">{session.user.name}</div>
                        <div className="text-zinc-400 text-xs">{session.user.email}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <Link href="/profile" className="block px-3 py-2 hover:bg-zinc-700 rounded">
                          Account / Profile
                        </Link>
                        <Link href="/notifications" className="block px-3 py-2 hover:bg-zinc-700 rounded">
                          Notifications
                        </Link>
                        <button
                          onClick={() => signOut()}
                          className="w-full text-left text-red-400 hover:text-white px-3 py-2 hover:bg-red-600 rounded transition"
                        >
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-white p-1 rounded hover:bg-zinc-700/60"
          aria-label="Open menu"
        >
          <Bars3Icon className="w-7 h-7" />
        </button>
      </nav>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={query}
        setQuery={setQuery}
        coins={results}
        trending={trending}
        onSelect={handleSearchSelect} 
      />

      <ConverterModal open={converterOpen} onClose={() => setConverterOpen(false)} />

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 bottom-0 z-50 w-[88%] max-w-sm bg-zinc-900 border-l border-zinc-700 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Image src="/images/crypto_logo.png" alt="logo" width={28} height={28} />
                  <span className="text-white font-bold">CryptoIA</span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-zinc-400 hover:text-white p-2"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-4 pt-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchOpen(true);
                  }}
                  className="flex-1 flex items-center gap-2 bg-zinc-800 px-3 py-2 rounded-lg text-zinc-300"
                >
                  <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />
                  <span className="text-sm">Search coins…</span>
                </button>
                <button
                  onClick={() => setConverterOpen(true)}
                  className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center"
                  aria-label="Converter"
                >
                  <CalculatorIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 py-3 space-y-4">
                {session?.user ? (
                  <>
                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center font-semibold text-white">
                            {userInitial}
                          </div>
                          <span className="text-white font-medium text-sm">Main</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowAddAsset(true);
                            setMenuOpen(false);
                          }}
                          className="text-zinc-400 hover:text-white"
                          title="Add Asset"
                        >
                          <PlusCircleIcon className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="mt-2 text-2xl font-semibold text-white">
                        {loading ? 'Loading…' : formattedValue}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`${profitColor} px-2 py-0.5 rounded text-sm font-medium`}>
                          {isProfit ? '+' : '-'}
                          {percent}%
                        </span>
                        <span className={`${isProfit ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
                          ${profit}
                        </span>
                        <span className="text-zinc-400 text-xs">24h</span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setShowAddAsset(true);
                            setMenuOpen(false);
                          }}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm transition"
                        >
                          ➕ Add Asset
                        </button>
                        <Link
                          href="/portfolio"
                          onClick={() => setMenuOpen(false)}
                          className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm text-center transition"
                        >
                          📂 Open Portfolio
                        </Link>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <Link
                        href="/watchlist"
                        onClick={() => setMenuOpen(false)}
                        className="bg-zinc-800 text-white rounded-lg px-3 py-2 text-center"
                      >
                        ⭐ Watchlist
                      </Link>
                    </div>

                    <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4">
                      <div className="mb-3 text-sm text-white">
                        <div className="font-semibold">{session.user.name}</div>
                        <div className="text-zinc-400 text-xs">{session.user.email}</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <Link
                          href="/profile"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 hover:bg-zinc-700 rounded"
                        >
                          Account / Profile
                        </Link>
                        <Link
                          href="/notifications"
                          onClick={() => setMenuOpen(false)}
                          className="block px-3 py-2 hover:bg-zinc-700 rounded"
                        >
                          Notifications
                        </Link>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            signOut();
                          }}
                          className="w-full text-left text-red-400 hover:text-white px-3 py-2 hover:bg-red-600 rounded transition"
                        >
                          Log out
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition text-white text-center"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {showAddAsset && (
        <AddAssetModal onClose={() => setShowAddAsset(false)} onSelect={handleCoinSelect} />
      )}
      {selectedCoin && (
        <AddTransactionModal
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
          onSubmit={handleTransactionComplete}
        />
      )}
    </>
  );
}

function SearchModal({
  open,
  onClose,
  query,
  setQuery,
  coins,
  trending,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  setQuery: (v: string) => void;
  coins: MarketCoin[];
  trending: MarketCoin[];
  onSelect: (c: MarketCoin) => void; 
}) {
  const [highlight, setHighlight] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setHighlight(0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      const list = query ? coins : trending;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, Math.max(list.length - 1, 0)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = list[highlight];
        if (item) onSelect(item);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, query, coins, trending, onClose, onSelect, highlight]);

  const list = query ? coins : trending;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[61] left-1/2 -translate-x-1/2 top-20 w-[92%] max-w-[520px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700">
              <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                }}
                placeholder="Search coin, symbol…"
                className="w-full bg-transparent outline-none text-sm text-white placeholder-zinc-500"
              />
              <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span>{query ? 'Results' : '🔥 Trending Assets'}</span>
              </div>
              <span>Price / 24h %</span>
            </div>

            <div ref={listRef} className="max-h-[360px] overflow-y-auto divide-y divide-zinc-800">
              {list.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-zinc-400">No matches.</div>
              ) : (
                list.map((c, i) => {
                  const ch = c.price_change_percentage_24h ?? 0;
                  const col = ch >= 0 ? 'text-green-400' : 'text-red-400';
                  const isActive = i === highlight;
                  return (
                    <button
                      key={c.id}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => onSelect(c)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition ${
                        isActive ? 'bg-zinc-800/70' : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <StarIcon className="w-4 h-4 text-zinc-400" />
                        <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />
                        <div className="leading-tight">
                          <div className="text-white text-sm font-medium">{c.symbol.toUpperCase()}</div>
                          <div className="text-[11px] text-zinc-400">{c.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          ${c.current_price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                        </div>
                        <div className={`text-[12px] ${col}`}>{ch.toFixed(2)}%</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 text-[11px] text-zinc-400 bg-zinc-900">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">ESC</kbd>
                <span>Cancel</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">↵</kbd>
                <span>Select</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
