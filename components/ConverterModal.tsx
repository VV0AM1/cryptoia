'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  CalculatorIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

type CoinRow = {
  id: string;       
  symbol: string;    
  name: string;
  image: string;
  priceUSDT: number; 
  change24h: number;
};

type FiatRow = {
  code: string;     
  name: string;
  pair: string | null;
  rateUSDT: number;  
};

type Props = { open: boolean; onClose: () => void };

type AssetRef =
  | { kind: 'coin'; id: string }
  | { kind: 'fiat'; code: string };

export default function ConverterModal({ open, onClose }: Props) {
  const [coins, setCoins] = useState<CoinRow[]>([]);
  const [fiats, setFiats] = useState<FiatRow[]>([]);
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState<AssetRef>({ kind: 'coin', id: 'BTCUSDT' });
  const [to, setTo] = useState<AssetRef>({ kind: 'fiat', code: 'USD' });
  const [pickerFor, setPickerFor] = useState<'from' | 'to' | null>(null);

  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      const r = await fetch('/api/market/converter', { cache: 'no-store' });
      const j = await r.json();
      if (!live) return;
      setCoins(j.coins ?? []);
      setFiats(j.fiats ?? []);
    })();
    return () => { live = false; };
  }, [open]);

  const usdtPerUnit = (a: AssetRef) => {
    if (a.kind === 'coin') return coins.find((c) => c.id === a.id)?.priceUSDT ?? 0;
    const f = fiats.find((x) => x.code === a.code);
    return f ? (f.pair ? f.rateUSDT : 1) : 0;
  };

  const fromUSDT = usdtPerUnit(from);
  const toUSDT = usdtPerUnit(to);

  const outValue = useMemo(() => {
    const a = parseFloat(amount) || 0;
    if (!fromUSDT || !toUSDT) return 0;
    return a * (fromUSDT / toUSDT);
  }, [amount, fromUSDT, toUSDT]);

  const rateText = useMemo(() => {
    if (!fromUSDT || !toUSDT) return '—';
    const rate = fromUSDT / toUSDT;
    return `1 ${short(from, coins, fiats)} = ${fmt(rate)} ${short(to, coins, fiats)}`;
  }, [fromUSDT, toUSDT, from, to, coins, fiats]);

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
            className="fixed z-[61] left-1/2 -translate-x-1/2 top-20 w-[92%] max-w-[560px] rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-700">
              <div className="flex items-center gap-2 text-white">
                <CalculatorIcon className="w-5 h-5" />
                <span className="font-semibold text-lg">Converter</span>
              </div>
              <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Row
                asset={from}
                label="From"
                amount={amount}
                onAmount={setAmount}
                onPick={() => setPickerFor('from')}
                coins={coins}
                fiats={fiats}
              />
              <div className="flex justify-center">
                <button
                  onClick={() => { const a = from; setFrom(to); setTo(a); }}
                  className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center hover:bg-zinc-700"
                  title="Swap"
                >
                  <ArrowsUpDownIcon className="w-5 h-5" />
                </button>
              </div>
              <Row
                asset={to}
                label="To"
                amount={fmt(outValue)}
                onAmount={() => {}}
                readOnly
                onPick={() => setPickerFor('to')}
                coins={coins}
                fiats={fiats}
              />

              <div className="text-sm text-zinc-400 pt-1">
                <span className="text-zinc-500">Exchange Rate</span>
                <span className="ml-2 text-white font-medium">{rateText}</span>
              </div>
            </div>
          </motion.div>

          <Picker
            open={pickerFor !== null}
            onClose={() => setPickerFor(null)}
            active={pickerFor === 'from' ? from : to}
            onPick={(ref) => {
              if (pickerFor === 'from') setFrom(ref);
              if (pickerFor === 'to') setTo(ref);
              setPickerFor(null);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}


function Row({
  label,
  asset,
  amount,
  onAmount,
  readOnly,
  onPick,
  coins,
  fiats,
}: {
  label: string;
  asset: AssetRef;
  amount: string;
  onAmount: (v: string) => void;
  readOnly?: boolean;
  onPick: () => void;
  coins: CoinRow[];
  fiats: FiatRow[];
}) {
  const meta = getMeta(asset, coins, fiats);
  return (
    <div className="flex items-stretch gap-3">
      <button
        onClick={onPick}
        className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-left hover:bg-zinc-700/70"
      >
        <div className="flex items-center gap-3">
          <img src={meta.image} alt={meta.title} className="w-6 h-6 rounded-full" />
        </div>
        <div className="ml-9 -mt-6">
          <div className="text-white font-medium leading-tight">
            {meta.symbol} <ChevronDownIcon className="inline w-4 h-4 text-zinc-400 ml-1" />
          </div>
          <div className="text-[11px] text-zinc-400">{meta.title}</div>
        </div>
      </button>
      <div className="w-40 sm:w-48 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2">
        <input
          type="number"
          min="0"
          step="any"
          value={amount}
          onChange={(e) => onAmount(e.target.value)}
          readOnly={readOnly}
          className="w-full bg-transparent outline-none text-right text-white text-lg"
          aria-label={label}
        />
        <div className="text-[11px] text-zinc-500 text-right">{meta.subnote}</div>
      </div>
    </div>
  );
}

function Picker({
  open,
  onClose,
  active,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  active: AssetRef;
  onPick: (ref: AssetRef) => void;
}) {
  const [q, setQ] = useState('');
  const [coins, setCoins] = useState<CoinRow[]>([]);
  const [fiats, setFiats] = useState<FiatRow[]>([]);

  // initial 5+5
  useEffect(() => {
    if (!open) return;
    let live = true;
    (async () => {
      const r = await fetch('/api/market/converter', { cache: 'no-store' });
      const j = await r.json();
      if (!live) return;
      setCoins(j.coins ?? []);
      setFiats(j.fiats ?? []);
    })();
    return () => { live = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = setTimeout(async () => {
      const query = q.trim();
      const url = query ? `/api/market/converter?q=${encodeURIComponent(query)}&limit=10` : '/api/market/converter';
      const r = await fetch(url, { cache: 'no-store' });
      const j = await r.json();
      setCoins(j.coins ?? []);
      setFiats(j.fiats ?? []);
    }, 300);
    return () => clearTimeout(h);
  }, [open, q]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed z-[71] left-1/2 -translate-x-1/2 top-16 w-[92%] max-w-[520px] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-700">
              <span className="text-white font-semibold">Select Currency</span>
              <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for Currency…"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              <Section>Fiat Currencies</Section>
              {fiats.slice(0, 5).map((f) => (
                <PickRow
                  key={f.code}
                  image={flag(f.code)}
                  title={f.name}
                  subtitle={f.code}
                  right={f.rateUSDT ? `${fmt(f.rateUSDT)} USDT` : '—'}
                  active={active.kind === 'fiat' && active.code === f.code}
                  onClick={() => onPick({ kind: 'fiat', code: f.code })}
                />
              ))}

              <Section>Cryptocurrencies</Section>
              {coins.slice(0, 10).map((c) => (
                <PickRow
                  key={c.id}
                  image={c.image}
                  title={c.name}
                  subtitle={c.symbol.toUpperCase()}
                  right={`$${fmt(c.priceUSDT)}`}
                  active={active.kind === 'coin' && active.id === c.id}
                  onClick={() => onPick({ kind: 'coin', id: c.id })}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-1 text-[11px] uppercase tracking-wide text-zinc-400">
      {children}
    </div>
  );
}

function PickRow({
  image,
  title,
  subtitle,
  right,
  active,
  onClick,
}: {
  image: string;
  title: string;
  subtitle: string;
  right?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-zinc-800/60 transition ${
        active ? 'bg-zinc-800/70' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <img src={image} alt={title} className="w-6 h-6 rounded-full" />
        <div className="text-left">
          <div className="text-sm text-white">{title}</div>
          <div className="text-[11px] text-zinc-400">{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {right && <div className="text-sm text-zinc-300">{right}</div>}
        {active && <CheckIcon className="w-4 h-4 text-sky-400" />}
      </div>
    </button>
  );
}


function getMeta(a: AssetRef, coins: CoinRow[], fiats: FiatRow[]) {
  if (a.kind === 'coin') {
    const c = coins.find((x) => x.id === a.id);
    return c
      ? { image: c.image, symbol: c.symbol, title: c.name, subnote: `1 ${c.symbol} = $${fmt(c.priceUSDT)}` }
      : { image: '/default-coin.png', symbol: '—', title: '—', subnote: '' };
  }
  const f = fiats.find((x) => x.code === a.code);
  const rate = f?.pair ? f?.rateUSDT ?? 0 : 1;
  return {
    image: flag(a.code),
    symbol: a.code,
    title: f?.name ?? a.code,
    subnote: `1 ${a.code} = ${rate ? `${fmt(rate)} USDT` : '—'}`,
  };
}

function short(a: AssetRef, coins: CoinRow[], fiats: FiatRow[]) {
  return a.kind === 'coin' ? (coins.find((x) => x.id === a.id)?.symbol ?? '—') : a.code;
}

function fmt(n: number) {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1) return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return n.toLocaleString(undefined, { maximumFractionDigits: 8 });
}

function flag(code: string) {
  const map: Record<string, string> = { USD: 'us', EUR: 'eu', GBP: 'gb', RUB: 'ru', CAD: 'ca' };
  return `https://flagcdn.com/48x36/${map[code] ?? 'us'}.png`;
}