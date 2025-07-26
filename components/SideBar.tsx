'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSidebar } from '@/app/context/SidebarContext';

import {
  HomeIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  BellAlertIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';

import { FaInstagram, FaGithub } from 'react-icons/fa';

const OPENED_WIDTH = 300;
const CLOSED_WIDTH = 80;

const sections = [
  {
    title: 'Assets',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Portfolio', href: '/1/portfolio', icon: BriefcaseIcon },
      { name: 'Market', href: '/market', icon: CurrencyDollarIcon },
      { name: 'Add Assets', href: '/', icon: PlusCircleIcon },
    ],
  },
  {
    title: 'Tools & Analytics',
    items: [
      { name: 'Performance', href: '/performance', icon: ChartBarIcon },
      { name: 'Converters', href: '/converters', icon: ArrowsRightLeftIcon },
      { name: 'Alerts / Watchlist', href: '/alerts', icon: BellAlertIcon },
    ],
  },
  {
    title: 'Utility',
    items: [
      { name: 'Notifications', href: '/notifications', icon: BellAlertIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      { name: 'Account / Profile', href: '/account', icon: UserCircleIcon },
    ],
  },
];

export default function SideBar() {
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024); 
  const { isOpened, toggle } = useSidebar();

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1440;
  const showSidebar = !isMobile;
  const allowHover = !isTablet && !isMobile;
  const isExpanded =
    windowWidth > 1024 && (isOpened || (isHovered && allowHover));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

    
      if (width > 768 && width <= 1024 && isOpened) {
        toggle(); 
      }
    };

    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpened, toggle]);

  if (!showSidebar) return null; 

  return (
    <div
      onMouseEnter={() => {
        if (windowWidth > 1024 && !isOpened) setIsHovered(true);
      }}
      onMouseLeave={() => {
        if (windowWidth > 1024) setIsHovered(false);
      }}
      style={{ width: isExpanded ? OPENED_WIDTH : CLOSED_WIDTH }}
      className="fixed h-screen flex flex-col p-4 items-start justify-between bg-zinc-800 text-zinc-50 transition-all duration-300 z-50 border-r border-zinc-700"
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center space-x-2">
          <Image
            src="/images/crypto_logo.png"
            alt="logo"
            width={isExpanded ? 52 : 56}
            height={32}
          />
          {isExpanded && <p className="font-extrabold text-lg">CryptoIA</p>}
        </div>
        {isExpanded && (
          <button
            onClick={windowWidth > 1024 ? toggle : undefined}
            disabled={windowWidth <= 1024}
            className="p-1 text-zinc-400 hover:text-zinc-100 ml-auto"
          >
            {isOpened ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
          </button>
        )}
      </div>

      <div className="flex flex-col ml-1 w-full mb-6">
        {sections.map(({ title, items }) => (
          <div key={title} className="flex flex-col mt-4 px-2 w-full">
            <h2 className={`font-bold text-2xl mb-2 ${isExpanded ? 'text-zinc-50' : 'sr-only'}`}>{title}</h2>
            <ul className="text-lg font-semibold space-y-1">
              {items.map(({ name, href, icon: Icon }) => (
                <li
                  key={name}
                  className={`flex px-4 py-3 rounded-2xl w-full hover:bg-zinc-700 transition duration-100 ${
                    isExpanded ? 'justify-start' : 'justify-center'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-zinc-400 h-6 w-6 flex-shrink-0" />
                    <Link
                      href={href}
                      className={`text-zinc-50 whitespace-nowrap transition-all duration-200 ${
                        isExpanded ? 'opacity-100 w-auto ml-1' : 'opacity-0 w-0 overflow-hidden'
                      }`}
                    >
                      {name}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center w-full space-y-4">
        {isExpanded && (
          <div className="flex flex-col space-y-2 w-full px-2">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-zinc-700 text-zinc-50 rounded-lg py-2 px-3 hover:opacity-90 transition"
            >
              <Image src="/images/svgs/brand-google-play.svg" alt="Google Play" width={20} height={20} className="mr-2" />
              Google Play
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center bg-zinc-700 text-zinc-50 rounded-lg py-2 px-3 hover:opacity-90 transition"
            >
              <Image src="/images/svgs/brand-apple.svg" alt="App Store" width={20} height={20} className="mr-2" />
              App Store
            </a>
          </div>
        )}

        <div className="flex space-x-4 ">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-100 transition">
            <FaInstagram className="w-6 h-6" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-100 transition">
            <FaGithub className="w-6 h-6" />
          </a>
        </div>
      </div>
    </div>
  );
}