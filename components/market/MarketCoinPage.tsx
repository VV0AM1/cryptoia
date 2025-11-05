"use client";
import Image from "next/image";
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
  const contentWidth = "w-full lg:w-[calc(100%-300px)]";

  return (
    <div className={` ${marginLeft} ${contentWidth} bg-zinc-900 min-h-dvh text-white px-4 sm:px-6 md:px-8 py-6`}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <img src={initial.image} alt={initial.name} className="w-8 h-8 rounded-full" />
          <div>
            <div className="text-xl font-bold">{initial.name}</div>
            <div className="text-xs text-zinc-400">{initial.symbol.toUpperCase()}{m.exInfo?.base && m.exInfo?.quote ? ` • ${m.exInfo.base}/${m.exInfo.quote}` : ""}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">${fmt(m.price, { maximumFractionDigits: m.exInfo?.priceStep ?? 8 })}</div>
          <div className={positive ? "text-green-400" : "text-red-400"}>{m.change?.toFixed(2)}%</div>
          {m.ticker && (
            <div className="text-xs text-zinc-400">24h: ${fmt(+m.ticker.lowPrice)} → ${fmt(+m.ticker.highPrice)}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 xl:grid-rows-[auto_auto] gap-6 items-start">
        <div className="xl:col-span-8">
          <PriceVolumeChart
            candles={m.candles}
            series={m.data}
            positive={positive}
            interval={m.interval}
            onIntervalChange={m.setIntervalState}
            loading={m.loading}
          />
        </div>

        <aside className="xl:col-span-4 xl:row-span-2 space-y-6">
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

        <div className="xl:col-span-7 xl:col-start-1 xl:row-start-2">
          <TradesTable trades={m.trades} qtyStep={m.exInfo?.qtyStep} />
        </div>
      </div>
    </div>
  
  );
}
