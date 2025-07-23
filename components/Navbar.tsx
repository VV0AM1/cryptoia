'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FaCalculator } from 'react-icons/fa6';
import { Cog6ToothIcon, StarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';

export default function NavBar() {
  const [coinName, setCoinName] = useState('');
  const { isOpened } = useSidebar();
  const { data: session } = useSession();

  const paddinLeft = isOpened ? 'pl-[320px]' : 'pl-[100px]';

  return (
    <nav className={`fixed top-0 z-40 bg-zinc-800 border-b border-zinc-700 px-6 py-5 flex items-center justify-between ${paddinLeft} w-full`}>
      <div className="flex items-center bg-zinc-700 px-4 py-3 rounded-full w-full max-w-md">
        <input
          type="text"
          placeholder="Search Coin, CA, Fund, Category or Exchange..."
          value={coinName}
          onChange={(e) => setCoinName(e.target.value)}
          className="bg-transparent text-sm placeholder-zinc-400 text-white focus:outline-none w-full"
        />
        <kbd className="ml-2 text-zinc-500 text-xs px-1.5 py-0.5 border border-zinc-600 rounded">/</kbd>
        <FaCalculator className="ml-3 text-zinc-500 h-6 w-6" />
      </div>

      <div className="flex items-center space-x-3 ml-4">
        <StarIcon className="w-7 h-7 text-zinc-400 hover:text-zinc-100 cursor-pointer" />
        <Cog6ToothIcon className="w-7 h-7 text-zinc-400 hover:text-zinc-100 cursor-pointer" />
        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-md px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition"
            >
              Welcome, {session.user.name}
            </Link>
            <button
              onClick={() => signOut()}
              className="text-md px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-md px-4 py-2 border border-zinc-600 rounded-md hover:bg-zinc-700 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-md px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}