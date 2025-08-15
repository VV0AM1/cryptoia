'use client';

import { useEffect, useState, type ComponentType, type SVGProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useSidebar } from '@/app/context/SidebarContext';
import ConverterModal from '@/components/ConverterModal';

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
  StarIcon,
} from '@heroicons/react/24/solid';
import { FaInstagram, FaGithub } from 'react-icons/fa';

const OPENED_WIDTH = 300;
const CLOSED_WIDTH = 80;

type Item = {
  name: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
};
type Section = { title: string; items: Item[] };

const sections: Section[] = [
  {
    title: 'Assets',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon },
      { name: 'Market', href: '/market', icon: CurrencyDollarIcon },
      { name: 'Add Assets', href: '/#add-asset', icon: PlusCircleIcon, badge: 'New' },
    ],
  },
  {
    title: 'Tools & Analytics',
    items: [
      { name: 'Performance', href: '/performance', icon: ChartBarIcon },
      { name: 'Converters', href: '/converters', icon: ArrowsRightLeftIcon },
      { name: 'Alerts', href: '/alerts', icon: BellAlertIcon },
      { name: 'Watchlist', href: '/watchlist', icon: StarIcon },
    ],
  },
  {
    title: 'Utility',
    items: [
      { name: 'Notifications', href: '/notifications', icon: BellAlertIcon },
      { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
      { name: 'Account', href: '/account', icon: UserCircleIcon },
    ],
  },
];

export default function SideBar() {
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);
  const { isOpened, toggle } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [converterOpen, setConverterOpen] = useState(false);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth > 768 && windowWidth <= 1440;
  const allowHover = !isTablet && !isMobile;
  const isExpanded = windowWidth > 1024 && (isOpened || (isHovered && allowHover));
  const showSidebar = !isMobile;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width > 768 && width <= 1024 && isOpened) toggle();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpened, toggle]);

  if (!showSidebar) return null;

  return (
    <>
      <aside
        onMouseEnter={() => { if (windowWidth > 1024 && !isOpened) setIsHovered(true); }}
        onMouseLeave={() => { if (windowWidth > 1024) setIsHovered(false); }}
        style={{ width: isExpanded ? OPENED_WIDTH : CLOSED_WIDTH }}
        className="
          fixed h-screen flex flex-col justify-between
          bg-zinc-800/95 text-zinc-50 border-r border-zinc-800
          backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm
          transition-[width] duration-300 z-50 overflow-x-hidden
        "
        aria-label="Sidebar"
      >
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src="/images/crypto_logo.png"
                  alt="CryptoIA"
                  width={isExpanded ? 40 : 44}
                  height={40}
                  className="rounded-md"
                  priority
                />
                <div className="absolute inset-0 rounded-md bg-cyan-500/10 blur-md pointer-events-none" />
              </div>
              {isExpanded && (
                <span className="font-extrabold text-lg tracking-tight">CryptoIA</span>
              )}
            </div>

            {isExpanded && (
              <button
                onClick={windowWidth > 1024 ? toggle : undefined}
                disabled={windowWidth <= 1024}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition"
                aria-label="Toggle sidebar"
                title="Toggle sidebar"
              >
                {isOpened ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4">
          {sections.map(({ title, items }) => (
            <div key={title} className="mt-2">
              <div className={`${isExpanded ? 'px-3 mb-2' : 'sr-only'}`}>
                <h2 className="text-[11px] uppercase tracking-wider text-zinc-400/80">{title}</h2>
              </div>

              <ul className="space-y-1">
                {items.map(({ name, href, icon: Icon, badge }) => {
                  const isConverter = name.toLowerCase() === 'converters';
                  const active = !isConverter && (pathname === href || (href !== '/' && pathname.startsWith(href)));

                  const rowClass = `
                    flex items-center gap-3 rounded-xl
                    ${isExpanded ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center'}
                    transition
                    ${active ? 'bg-zinc-800/70 border border-zinc-700'
                             : 'hover:bg-zinc-800/50 border border-transparent'}
                  `;

                  const iconClass = `
                    h-6 w-6 flex-shrink-0
                    ${active ? 'text-cyan-400' : 'text-zinc-400 group-hover:text-zinc-200'}
                  `;

                  const label = (
                    <>
                      <Icon className={iconClass} />
                      <span
                        className={`
                          text-sm ${active ? 'text-white' : 'text-zinc-200'}
                          ${isExpanded ? 'opacity-100 ml-1' : 'opacity-0 w-0 overflow-hidden'}
                          transition-all duration-200
                        `}
                      >
                        {name}
                      </span>
                      {isExpanded && badge && (
                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          {badge}
                        </span>
                      )}
                    </>
                  );

                  return (
                    <li key={name} className="relative group">
                      {isConverter ? (
                        <button
                          type="button"
                          onClick={() => setConverterOpen(true)}
                          className={rowClass}
                          title="Open Converter"
                        >
                          {label}
                        </button>
                      ) : (
                        <Link href={href} className={rowClass} aria-current={active ? 'page' : undefined}>
                          {label}
                        </Link>
                      )}

                      {!isExpanded && (
                        <div
                          className="
                            pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3
                            opacity-0 group-hover:opacity-100
                            transition bg-zinc-800 text-zinc-100 text-xs
                            px-2 py-1 rounded-md border border-zinc-700 shadow-xl
                            whitespace-nowrap
                          "
                        >
                          {name}
                          {badge && <span className="ml-1 text-cyan-400">{badge}</span>}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800/80">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 bg-zinc-800 text-zinc-50 rounded-lg py-2 px-3 hover:opacity-90 transition border border-zinc-700 ${!isExpanded && 'hidden'}`}
            >
              <Image src="/images/svgs/brand-google-play.svg" alt="Google Play" width={16} height={16} />
              <span className="text-xs">Google Play</span>
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 bg-zinc-800 text-zinc-50 rounded-lg py-2 px-3 hover:opacity-90 transition border border-zinc-700 ${!isExpanded && 'hidden'}`}
            >
              <Image src="/images/svgs/brand-apple.svg" alt="App Store" width={16} height={16} />
              <span className="text-xs">App Store</span>
            </a>
          </div>

          <div className={`flex ${isExpanded ? 'justify-between' : 'justify-center'} items-center mb-3`}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-100 transition" aria-label="Instagram" title="Instagram">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-100 transition" aria-label="GitHub" title="GitHub">
              <FaGithub className="w-5 h-5" />
            </a>
          </div>

          {session?.user && (
            <div className={`${isExpanded ? 'flex items-center gap-3' : 'flex items-center justify-center'} bg-zinc-800/60 border border-zinc-700 rounded-xl p-2`}>
              <div className="w-8 h-8 rounded-full bg-cyan-600/80 text-white flex items-center justify-center font-semibold">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{session.user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{session.user.email}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => signOut()}
                      className="flex-1 text-center text-xs px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 transition"
                      title="Log out"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      <ConverterModal open={converterOpen} onClose={() => setConverterOpen(false)} />
    </>
  );
}