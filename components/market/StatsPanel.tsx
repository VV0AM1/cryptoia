"use client";
import type { Ticker24h } from "./types";
import { BN, calcSpread, fmt } from "./utils";

export function StatsPanel({ ticker, volBase, volQuote, time, priceStep, qtyStep }:{
  ticker: Ticker24h | null;
  volBase: number;
  volQuote: number;
  time?: number;
  priceStep?: number;
  qtyStep?: number;
}) {
  const bid = ticker ? BN(ticker.bidPrice) : NaN;
  const ask = ticker ? BN(ticker.askPrice) : NaN;
  const spread = calcSpread(bid, ask);

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 space-y-3">
      <h3 className="font-semibold flex items-center justify-between">Statistics (24h)
        {time && <span className="text-xs text-zinc-400 font-normal">{new Date(time).toLocaleTimeString()}</span>}
      </h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="High" value={`$${fmt(BN(ticker?.highPrice ?? 0))}`} />
        <Stat label="Low" value={`$${fmt(BN(ticker?.lowPrice ?? 0))}`} />
        <Stat label="Open" value={`$${fmt(BN(ticker?.openPrice ?? 0))}`} />
        <Stat label="Prev Close" value={`$${fmt(BN(ticker?.prevClosePrice ?? 0))}`} />
        <Stat label="Weighted Avg" value={`$${fmt(BN(ticker?.weightedAvgPrice ?? 0))}`} />
        <Stat label="Change ($)" value={`$${fmt(BN(ticker?.priceChange ?? 0))}`} />
        <Stat label="Volume (Base)" value={`${fmt(BN(ticker?.volume ?? volBase), { maximumFractionDigits: qtyStep ?? 4 })}`} />
        <Stat label="Volume (Quote)" value={`$${fmt(BN(ticker?.quoteVolume ?? volQuote))}`} />
        <Stat label="# Trades" value={`${fmt(BN(ticker?.count ?? 0))}`} />
        <Stat label="Best Bid" value={`$${fmt(bid)} (${fmt(BN(ticker?.bidQty ?? 0))})`} />
        <Stat label="Best Ask" value={`$${fmt(ask)} (${fmt(BN(ticker?.askQty ?? 0))})`} />
        <Stat label="Spread" value={`$${fmt(spread.value, { maximumFractionDigits: priceStep ?? 6 })} (${spread.pct.toFixed(3)}%)`} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-zinc-700/50">
        <Stat label="Market Cap" value="— (not on Binance)" />
        <Stat label="FDV" value="— (not on Binance)" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900/60 rounded-xl p-3"><div className="text-xs text-zinc-400">{label}</div><div className="font-medium mt-0.5">{value}</div></div>
  );
}
