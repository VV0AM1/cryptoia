'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaBars, FaCalculator } from 'react-icons/fa';
import { Star, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioSummary } from '@/hooks/usePortfolioSummary'; 

export default function NavBar() {
  const [coinName, setCoinName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const { isOpened } = useSidebar();
  const { data: session } = useSession();
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const { summary, loading } = usePortfolioSummary();

  const desktopPadding = isOpened ? 'lg:pl-[320px]' : 'lg:pl-[100px]';
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() || 'U';

  const formattedValue = `$${summary.totalCurrentValue.toFixed(2)}`;
  const profit = summary.totalProfit.toFixed(2);
  const percent = summary.percentageChange24h.toFixed(2);
  const isProfit = summary.totalProfit >= 0;
  const profitColor = isProfit ? 'text-green-400 bg-green-700/30' : 'text-red-400 bg-red-700/30';

  return (
    <nav className={`fixed top-0 z-40 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 flex items-center justify-between w-full ${desktopPadding}`}>
      {/* Search */}
      <div className="flex items-center bg-zinc-700 px-4 py-2 rounded-full w-full max-w-xs sm:max-w-md">
        <input
          type="text"
          placeholder="Search Coin, CA, Fund, Category or Exchange..."
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
          className="bg-transparent text-sm placeholder-zinc-400 text-white focus:outline-none w-full"
        />
        <kbd className="ml-2 text-zinc-500 text-xs px-1.5 py-0.5 border border-zinc-600 rounded hidden sm:inline">/</kbd>
        <FaCalculator className="ml-3 text-zinc-500 h-5 w-5" />
      </div>

      {/* Right Desktop Area */}
      <div className="hidden md:flex items-center space-x-3 ml-4">
        {session?.user ? (
          <>
            {/* Portfolio Value Box */}
        <div className="relative">
          <button
            onClick={() => setPortfolioDropdownOpen(prev => !prev)}
            className="bg-zinc-700 text-white rounded-full flex items-center px-4 py-1 gap-2 text-sm shadow-sm hover:shadow-md transition"
          >
            <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center font-semibold text-white">
              {userInitial}
            </div>
            <span>${formattedValue}</span>
            <span className="text-green-400 bg-green-700/30 px-2 py-0.5 rounded text-xs">${profit}</span>
            <span className="text-sm text-zinc-400">▾</span>
          </button>

          <AnimatePresence>
            {portfolioDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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
                  <button className="text-zinc-400 hover:text-white">
                    👁️
                  </button>
                </div>
                <div className="text-2xl font-semibold text-white">
                  {loading ? 'Loading...' : formattedValue}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`${profitColor} px-2 py-0.5 rounded text-sm font-medium`}>
                    {isProfit ? '+' : '-'}{percent}%
                  </span>
                  <span className={`${isProfit ? 'text-green-400' : 'text-red-400'} text-sm font-medium`}>
                    ${profit}
                  </span>
                  <span className="text-zinc-400 text-xs">24h</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded-lg text-sm transition">
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

            {/* Star Icon */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.15 }}
              className="text-yellow-400 hover:text-yellow-300"
              title="Favorites"
            >
              <Star className="w-6 h-6" fill="#facc15" />
            </motion.button>

            {/* Avatar */}
            <div className="relative">
              <button
                onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                className="w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center"
              >
                <UserCircle className="text-white w-6 h-6" />
              </button>

              <AnimatePresence>
                {avatarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-4 z-50"
                  >
                    <div className="mb-3 text-sm text-white">
                      <div className="font-semibold">{session.user.name}</div>
                      <div className="text-zinc-400 text-xs">{session.user.email}</div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <Link href="/profile" className="block px-3 py-2 hover:bg-zinc-700 rounded">Profile</Link>
                      <Link href="/portfolio" className="block px-3 py-2 hover:bg-zinc-700 rounded">Portfolio</Link>
                      <Link href="/help" className="block px-3 py-2 hover:bg-zinc-700 rounded">Help</Link>
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
          <Settings className="w-6 h-6 text-zinc-400 hover:text-zinc-100 cursor-pointer" />
            <Link
              href="/login"
              className="text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition"
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

      {/* Mobile Menu */}
      <div className="md:hidden ml-4 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white focus:outline-none"
        >
          <FaBars className="w-6 h-6" />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-52 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4 space-y-3 z-50"
            >
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="block text-sm px-4 py-2 rounded-md hover:bg-zinc-700 transition">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition">
                    Login
                  </Link>
                  <Link href="/register" className="block text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Register
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}