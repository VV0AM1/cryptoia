import { notFound } from "next/navigation";
import MarketCoinPage from "@/components/market/MarketCoinPage";
import rawSymbolMap from "@/data/symbolMap.json";

type SymbolMeta = { name: string; image: string; id?: string };
const symbolMap = rawSymbolMap as Record<string, SymbolMeta>;

export const revalidate = 0; // SSR

async function fetchBinance(symbol: string) {
  const base = "https://api.binance.com/api/v3";
  const [tRes, kRes] = await Promise.all([
    fetch(`${base}/ticker/24hr?symbol=${symbol}`, { cache: "no-store" }),
    fetch(`${base}/klines?symbol=${symbol}&interval=1d&limit=365`, { cache: "no-store" }),
  ]);

  if (!tRes.ok) throw new Error("ticker failed");
  const ticker = await tRes.json();

  const klines = kRes.ok ? await kRes.json() : [];
  const chart = Array.isArray(klines)
    ? klines.map((k: any[]) => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }))
    : [];

  return {
    lastPrice: Number(ticker.lastPrice ?? 0),
    priceChangePercent: Number(ticker.priceChangePercent ?? 0),
    highPrice: Number(ticker.highPrice ?? 0),
    lowPrice: Number(ticker.lowPrice ?? 0),
    volume: Number(ticker.volume ?? 0),
    quoteVolume: Number(ticker.quoteVolume ?? 0),
    chart,
  };
}

// Accept either a plain params object (Next default) or a Promise (Netlify typing)
type Params = { symbol: string };
type MaybePromise<T> = T | Promise<T>;

export default async function Page({
  params,
}: {
  params: MaybePromise<Params>;
}) {
  const p = await Promise.resolve(params); // normalize
  const symbol = (p.symbol || "").toUpperCase();

  const meta = symbolMap[symbol];
  if (!meta) notFound();

  const data = await fetchBinance(symbol);

  return (
    <div className="w-full bg-zinc-900">
      <MarketCoinPage
        initial={{
          symbol,
          name: meta.name,
          image: meta.image,
          ...data,
        }}
      />
    </div>
  );
}