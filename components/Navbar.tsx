'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaCalculator, FaBars } from 'react-icons/fa';
import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';

export default function NavBar() {
  const [coinName, setCoinName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { isOpened } = useSidebar();
  const { data: session } = useSession();

  const desktopPadding = isOpened ? 'lg:pl-[320px]' : 'lg:pl-[100px]';

  return (
    <nav className={`fixed top-0 z-40 bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 flex items-center justify-between w-full ${desktopPadding}`}>
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

      <div className="hidden md:flex items-center space-x-3 ml-4">
        <StarIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-100 cursor-pointer" />
        <Cog6ToothIcon className="w-6 h-6 text-zinc-400 hover:text-zinc-100 cursor-pointer" />
        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition"
            >
              Welcome, {session.user.name}
            </Link>
            <button
              onClick={() => signOut()}
              className="text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
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

      <div className="md:hidden ml-4 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white focus:outline-none"
        >
          <FaBars className="w-6 h-6" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4 space-y-3 z-50">
            <div className="flex items-center justify-between">
              <StarIcon className="w-5 h-5 text-zinc-400" />
              <Cog6ToothIcon className="w-5 h-5 text-zinc-400" />
            </div>

            {session?.user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm px-4 py-2 rounded-md hover:bg-zinc-700 transition"
                >
                  Welcome, {session.user.name}
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
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}