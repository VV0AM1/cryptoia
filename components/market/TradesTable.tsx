

"use client";
import type { Trade } from "./types";
import { BN, fmt } from "./utils";

export function TradesTable({ trades, qtyStep }:{ trades: Trade[]; qtyStep?: number; }) {
  return (
    <div className="bg-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Recent Trades</h3>
        <div className="text-xs text-zinc-400">Latest 50</div>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 text-xs text-zinc-400 border-b border-zinc-700/50 pb-2">
        <div>Time</div>
        <div>Price</div>
        <div>Qty</div>
        <div className="hidden sm:block">Quote</div>
        <div className="hidden sm:block">Side</div>
      </div>
      <div className="divide-y divide-zinc-800 max-h-64 overflow-auto">
        {trades.map((t) => (
          <div key={t.id} className="grid grid-cols-3 sm:grid-cols-5 text-sm py-1">
            <div className="text-zinc-400">{new Date(t.time).toLocaleTimeString()}</div>
            <div className={t.isBuyerMaker ? "text-red-400" : "text-green-400"}>${fmt(BN(t.price))}</div>
            <div>{fmt(BN(t.qty), { maximumFractionDigits: qtyStep ?? 6 })}</div>
            <div className="hidden sm:block">${fmt(BN(t.quoteQty))}</div>
            <div className="hidden sm:block">{t.isBuyerMaker ? "Sell" : "Buy"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}