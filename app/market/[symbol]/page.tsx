import { notFound } from "next/navigation";
import MarketCoinPage from "@/components/market/MarketCoinPage";
import rawSymbolMap from "@/data/symbolMap.json";

type SymbolMeta = { name: string; image: string; id?: string };
const symbolMap = rawSymbolMap as Record<string, SymbolMeta>;

export const revalidate = 60; 
async function fetchBinance(symbol: string) {
  const base = "https://api.binance.com/api/v3";
  try {
    const [tRes, kRes] = await Promise.all([
      fetch(`${base}/ticker/24hr?symbol=${symbol}`, { cache: "no-store" }),
      fetch(`${base}/klines?symbol=${symbol}&interval=1d&limit=365`, { cache: "no-store" }),
    ]);

    if (!tRes.ok) throw new Error(`Failed to fetch ticker for ${symbol}`);
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
  } catch (error) {
    console.error('Failed to fetch Binance data:', error);
    return { chart: [], lastPrice: 0, priceChangePercent: 0, highPrice: 0, lowPrice: 0, volume: 0, quoteVolume: 0 };
  }
}

export default async function Page(props: any) {
  const params = await props?.params; 
  const symbol = String(params?.symbol ?? "").toUpperCase();

  const meta = symbolMap[symbol];
  if (!meta) notFound();

  const data = await fetchBinance(symbol);

  return (
    <div className="w-full h-screen bg-zinc-900">
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