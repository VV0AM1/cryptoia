    export type Candle = {
    t: number; 
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
    };


    export type Initial = {
    symbol: string;
    name: string;
    image: string;
    lastPrice: number;
    priceChangePercent: number;
    highPrice: number;
    lowPrice: number;
    volume: number; 
    quoteVolume: number; 
    chart: Candle[];
    };


    export type Ticker24h = {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    weightedAvgPrice: string;
    prevClosePrice: string;
    lastPrice: string;
    lastQty: string;
    bidPrice: string;
    bidQty: string;
    askPrice: string;
    askQty: string;
    openPrice: string;
    highPrice: string;
    lowPrice: string;
    volume: string; 
    quoteVolume: string;
    openTime: number;
    closeTime: number;
    firstId: number;
    lastId: number;
    count: number; 
    };


    export type Depth = {
    lastUpdateId: number;
    bids: [string, string][]; 
    asks: [string, string][];
    };


    export type Trade = {
    id: number;
    price: string;
    qty: string;
    quoteQty: string;
    time: number;
    isBuyerMaker: boolean;
    isBestMatch: boolean;
    };


    export type ExchangeInfo = {
    symbols: Array<{
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    filters: Array<{
    filterType: string;
    tickSize?: string;
    stepSize?: string;
    }>;
    }>;
};