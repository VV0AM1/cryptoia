"use client";
import { useSidebar } from "@/app/context/SidebarContext";
import type { Initial } from "./types";
import { fmt } from "./utils";
import { useBinanceMarket } from "@/hooks/useBinanceMarket";
import { PriceVolumeChart } from "./PriceVolumeChart";
import { StatsPanel } from "./StatsPanel";
import { OrderBook } from "./OrderBook";
import { TradesTable } from "./TradesTable";

export default function MarketCoinPage({ initial }: { initial: Initial }) {
  const { isOpened } = useSidebar();
  const m = useBinanceMarket(initial);

  const positive = m.change >= 0;
  const marginLeft = isOpened ? "md:ml-[300px]" : "md:ml-[190px]";

  return (
    <div className={`bg-zinc-900 text-white`}>
      <div
        className={`${marginLeft} max-w-screen-2xl mx-auto min-w-0 px-3 sm:px-4 md:px-6 py-4 md:py-6`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={initial.image} alt={initial.name} className="w-8 h-8 rounded-full shrink-0" />
            <div className="min-w-0">
              <div className="text-lg md:text-xl font-bold truncate">{initial.name}</div>
              <div className="text-xs text-zinc-400">
                {initial.symbol.toUpperCase()}
                {m.exInfo?.base && m.exInfo?.quote ? ` • ${m.exInfo.base}/${m.exInfo.quote}` : ""}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl md:text-2xl font-semibold">
              ${fmt(m.price, { maximumFractionDigits: m.exInfo?.priceStep ?? 8 })}
            </div>
            <div className={positive ? "text-green-400" : "text-red-400"}>{m.change?.toFixed(2)}%</div>
            {m.ticker && (
              <div className="text-xs text-zinc-400">
                24h: ${fmt(+m.ticker.lowPrice)} → ${fmt(+m.ticker.highPrice)}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-12 lg:grid-rows-[auto_auto] items-start min-w-0">
          <div className="lg:col-span-8 min-w-0">
            <PriceVolumeChart
              candles={m.candles}
              series={m.data}
              positive={positive}
              interval={m.interval}
              onIntervalChange={m.setIntervalState}
              loading={m.loading}
            />
          </div>

          <aside className="lg:col-span-4 lg:row-span-2 space-y-4 md:space-y-6 min-w-0">
            <StatsPanel
              ticker={m.ticker}
              volBase={m.volBase}
              volQuote={m.volQuote}
              time={m.ticker?.closeTime}
              priceStep={m.exInfo?.priceStep}
              qtyStep={m.exInfo?.qtyStep}
            />
            <OrderBook depth={m.depth} />
          </aside>

          <div className="min-w-0 lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <TradesTable trades={m.trades} qtyStep={m.exInfo?.qtyStep} />
          </div>
        </div>
      </div>
    </div>
  );
}