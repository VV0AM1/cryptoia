import type { Candle, ExchangeInfo } from "./types";

export const BN = (v: string | number) => Number(v);

export function fmt(n: number, opts: Intl.NumberFormatOptions = {}) {
  return Number.isFinite(n) ? n.toLocaleString(undefined, opts) : "—";
}

export function calcSpread(bid: number, ask: number) {
  if (!bid || !ask) return { value: 0, pct: 0 };
  const value = ask - bid;
  const pct = (value / ((ask + bid) / 2)) * 100;
  return { value, pct };
}

export function decimals(step?: string) {
  if (!step || !step.includes(".")) return 0;
  return step.split(".")[1].replace(/0+$/, "").length;
}

export function precisionFromFilters(filters: ExchangeInfo["symbols"][number]["filters"]) {
  const priceFilter = filters.find(f => f.filterType === "PRICE_FILTER");
  const lotFilter   = filters.find(f => f.filterType === "LOT_SIZE");
  const priceStep = priceFilter?.tickSize ? decimals(priceFilter.tickSize) : 8;
  const qtyStep   = lotFilter?.stepSize ? decimals(lotFilter.stepSize) : 8;
  return { priceStep, qtyStep };
}

export function toCandle(row: any[]) {
  return { t: +row[0], o: +row[1], h: +row[2], l: +row[3], c: +row[4], v: +row[5] };
}

export function calcRSI(candles: Candle[], period = 14) {
  if (candles.length < period + 1) return [] as number[];
  const rsis: number[] = new Array(candles.length).fill(NaN);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = candles[i].c - candles[i-1].c;
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsis[period] = 100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss));
  for (let i = period + 1; i < candles.length; i++) {
    const d = candles[i].c - candles[i-1].c;
    const g = Math.max(d, 0), l = Math.max(-d, 0);
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    const rs = avgLoss === 0 ? Infinity : avgGain / avgLoss;
    rsis[i] = 100 - 100 / (1 + rs);
  }
  return rsis;
}