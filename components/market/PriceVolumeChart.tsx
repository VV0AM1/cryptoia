"use client";
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { calcRSI } from "./utils";
import type { Candle } from "./types";

export function PriceVolumeChart({
  candles,
  series,
  positive,
  interval,
  onIntervalChange,
  loading,
}: {
  candles: Candle[];
  series: { x: string; c: number; v: number }[];
  positive: boolean;
  interval: string;
  onIntervalChange: (iv: any) => void;
  loading?: boolean;
}) {
  const rsi = calcRSI(candles, 14);
  const lastRSI = rsi[rsi.length - 1];

  return (
    <div className="bg-zinc-800 rounded-2xl p-4 min-w-0">
      <div className="flex items-center justify-between mb-2">
        <div className="text-zinc-400 text-sm">Price & Volume</div>
        <div className="flex items-center gap-1 text-xs">
          {["1m", "5m", "15m", "1h", "4h", "1d"].map((iv) => (
            <button
              key={iv}
              onClick={() => onIntervalChange(iv)}
              className={`px-2 py-1 rounded-lg border ${interval === iv ? "bg-zinc-700 border-zinc-600" : "border-zinc-700 hover:bg-zinc-700/50"}`}
            >
              {iv}
            </button>
          ))}
          {loading && <span className="ml-2 text-zinc-400">loading…</span>}
        </div>
      </div>

      <div className="h-[34vh] sm:h-[38vh] md:h-[42vh] xl:h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#3f3f4633" vertical={false} />
            <XAxis dataKey="x" hide />
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #3f3f46" }} />
            <Area dataKey="c" stroke={positive ? "#22c55e" : "#ef4444"} fill="url(#g)" strokeWidth={2} />
            <Bar dataKey="v" yAxisId={1} opacity={0.3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-xs text-zinc-400">
        RSI(14): <span className="text-white">{Number.isFinite(lastRSI) ? lastRSI.toFixed(1) : "—"}</span>
      </div>
    </div>
  );
}