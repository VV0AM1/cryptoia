"use client";
import type { Depth } from "./types";

export function OrderBook({ depth }: { depth: Depth | null }) {
  return (
    <div className="bg-zinc-800 rounded-2xl p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Order Book (Top 10)</h3>
        <div className="text-xs text-zinc-400">Live</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm min-w-0">
        <div className="min-w-0">
          <div className="text-zinc-400 text-[11px] sm:text-xs mb-1">Asks</div>
          <SideScroll rows={(depth?.asks ?? []).slice(0, 10)} align="right" color="text-red-400" />
        </div>
        <div className="min-w-0">
          <div className="text-zinc-400 text-[11px] sm:text-xs mb-1">Bids</div>
          <SideScroll rows={(depth?.bids ?? []).slice(0, 10)} align="left" color="text-green-400" />
        </div>
      </div>
    </div>
  );
}

function SideScroll({
  rows,
  align,
  color,
}: {
  rows: [string, string][];
  align: "left" | "right";
  color: string;
}) {
  return (
    <div className="max-h-60 md:max-h-72 overflow-auto pr-1">
      <OrderSide rows={rows} align={align} color={color} />
      {rows.length === 0 && <div className="text-xs text-zinc-500">No data</div>}
    </div>
  );
}

function OrderSide({
  rows,
  align,
  color,
}: {
  rows: [string, string][];
  align: "left" | "right";
  color: string;
}) {
  return (
    <div className="space-y-1 min-w-0">
      {rows.map(([p, q], i) => (
        <div key={i} className={`flex justify-between ${color} tabular-nums font-mono`}>
          <span className="truncate">{align === "right" ? q : p}</span>
          <span className="truncate">{align === "right" ? p : q}</span>
        </div>
      ))}
    </div>
  );
}