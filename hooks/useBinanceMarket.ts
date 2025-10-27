"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle, Depth, ExchangeInfo, Initial, Ticker24h, Trade } from "@/components/market/types";
import { BN, precisionFromFilters, toCandle } from "@/components/market/utils"

export type Interval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export function useBinanceMarket(initial: Initial) {
  const [price, setPrice] = useState(initial.lastPrice);
  const [change, setChange] = useState(initial.priceChangePercent);
  const [volQuote, setVolQuote] = useState(initial.quoteVolume);
  const [volBase, setVolBase] = useState(initial.volume);
  const [ticker, setTicker] = useState<Ticker24h | null>(null);
  const [depth, setDepth] = useState<Depth | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [candles, setCandles] = useState<Candle[]>(initial.chart);
  const [interval, setIntervalState] = useState<Interval>("1h");
  const [loading, setLoading] = useState(false);
  const [exInfo, setExInfo] = useState<{ priceStep: number; qtyStep: number; base?: string; quote?: string } | null>(null);

  const symbol = initial.symbol.toUpperCase();
  const symLower = symbol.toLowerCase();

  const wsK = useRef<WebSocket | null>(null);
  const wsD = useRef<WebSocket | null>(null);
  const wsT = useRef<WebSocket | null>(null);

  // Exchange info
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}`);
        const j: ExchangeInfo = await r.json();
        const s = j.symbols?.[0];
        if (s && alive) {
          const { priceStep, qtyStep } = precisionFromFilters(s.filters);
          setExInfo({ priceStep, qtyStep, base: s.baseAsset, quote: s.quoteAsset });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [symbol]);

  // 24h ticker polling
  useEffect(() => {
    let alive = true;
    const hit = async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`, { cache: "no-store" });
        const t: Ticker24h = await r.json();
        if (alive) {
          setTicker(t);
          setPrice(+t.lastPrice);
          setChange(+t.priceChangePercent);
          setVolQuote(+t.quoteVolume);
          setVolBase(+t.volume);
        }
      } catch {}
    };
    hit();
    const id = setInterval(hit, 15000);
    return () => { alive = false; clearInterval(id); };
  }, [symbol]);

  // Depth snapshot + ws
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=25`, { cache: "no-store" });
        const d: Depth = await r.json();
        if (alive) setDepth(d);
      } catch {}
    })();

    wsD.current?.close();
    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symLower}@depth5@100ms`);
      wsD.current = ws;
      ws.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.b && data?.a) setDepth({ lastUpdateId: Date.now(), bids: data.b.slice(0, 25), asks: data.a.slice(0, 25) });
        } catch {}
      };
    } catch {}

    return () => { alive = false; wsD.current?.close(); };
  }, [symbol, symLower]);

  // Trades snapshot + ws
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=50`, { cache: "no-store" });
        const t: Trade[] = await r.json();
        if (alive) setTrades(t);
      } catch {}
    })();

    wsT.current?.close();
    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symLower}@trade`);
      wsT.current = ws;
      ws.onmessage = ev => {
        try {
          const d = JSON.parse(ev.data);
          const tr: Trade = { id: d.t, price: d.p, qty: d.q, quoteQty: (Number(d.p) * Number(d.q)).toString(), time: d.T, isBuyerMaker: d.m, isBestMatch: true };
          setTrades(prev => [tr, ...prev.slice(0, 49)]);
          setPrice(Number(d.p));
        } catch {}
      };
    } catch {}

    return () => { alive = false; wsT.current?.close(); };
  }, [symbol, symLower]);

  // Klines snapshot + ws
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`, { cache: "no-store" });
        const arr: any[] = await r.json();
        if (alive) setCandles(arr.map(toCandle));
      } catch {}
      setLoading(false);
    })();

    wsK.current?.close();
    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symLower}@kline_${interval}`);
      wsK.current = ws;
      ws.onmessage = ev => {
        try {
          const d = JSON.parse(ev.data);
          if (!d.k) return;
          const k = d.k;
          setCandles(prev => {
            const next = prev.slice();
            const incoming: Candle = { t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v };
            const last = next[next.length - 1];
            if (!last || incoming.t > last.t) return [...next, incoming];
            next[next.length - 1] = incoming;
            return next;
          });
        } catch {}
      };
    } catch {}

    return () => { alive = false; wsK.current?.close(); };
  }, [symbol, symLower, interval]);

  // Derived
  const data = useMemo(() => candles.map(p => ({ x: new Date(p.t).toLocaleString(undefined, { hour12: false }), c: p.c, v: p.v })), [candles]);

  return {
    price,
    change,
    volQuote,
    volBase,
    ticker,
    depth,
    trades,
    candles,
    data,
    interval,
    setIntervalState,
    loading,
    exInfo,
  } as const;
}