"use client";
import type { Depth } from "./types";

export function OrderBook({ depth }: { depth: Depth | null }) {
  return (
    <div className="bg-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Order Book (Top 10)</h3>
        <div className="text-xs text-zinc-400">Live</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-zinc-400 text-xs mb-1">Asks</div>
          <OrderSide rows={(depth?.asks ?? []).slice(0, 10)} align="right" />
        </div>
        <div>
          <div className="text-zinc-400 text-xs mb-1">Bids</div>
          <OrderSide rows={(depth?.bids ?? []).slice(0, 10)} align="left" />
        </div>
      </div>
    </div>
  );
}

function OrderSide({ rows, align }: { rows: [string, string][]; align: "left" | "right" }) {
  return (
    <div className="space-y-1">
      {rows.map(([p, q], i) => (
        <div key={i} className={`flex justify-between text-sm ${align === "right" ? "text-red-400" : "text-green-400"}`}>
          <span>{align === "right" ? q : p}</span>
          <span>{align === "right" ? p : q}</span>
        </div>
      ))}
      {rows.length === 0 && <div className="text-xs text-zinc-500">No data</div>}
    </div>
  );
}
