const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  currentValueEur: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  changePercent: number;
  change: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalValueEur: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  eurRate: number;
}

export interface PortfolioResponse {
  holdings: Holding[];
  summary: PortfolioSummary;
}

export const getPortfolio = () => request<PortfolioResponse>("/api/portfolio");

export const addHolding = (data: {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  date?: string;
}) =>
  request("/api/portfolio", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteHolding = (id: string) =>
  request(`/api/holdings/${id}`, { method: "DELETE" });

// ── Stocks ────────────────────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  pe: number;
  eurRate: number;
}

export interface HistoricalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: { value: number; signal: number; histogram: number };
  bollingerBands: { upper: number; middle: number; lower: number };
  sma20: number;
  sma50: number;
  sma200: number;
  stochastic: { k: number; d: number };
  signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  score: number;
}

export const getStockQuote = (symbol: string) =>
  request<StockQuote>(`/api/stocks/${symbol}`);

export const getStockHistory = (symbol: string, period = "3mo") =>
  request<{ historical: HistoricalPoint[]; indicators: TechnicalIndicators }>(
    `/api/stocks/${symbol}/history?period=${period}`
  );

export const searchStocks = (q: string) =>
  request<Array<{ symbol: string; name: string; exchange: string }>>(
    `/api/stocks/search?q=${encodeURIComponent(q)}`
  );

// ── AI Analysis ───────────────────────────────────────────────────────────────

export interface AIAnalysis {
  summary: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidenceScore: number;
}

export const analyzeStock = (data: {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  technicalSignal: string;
  technicalScore: number;
  rsi: number;
  pe: number;
  marketCap: number;
}) =>
  request<AIAnalysis>("/api/ai/analyze", {
    method: "POST",
    body: JSON.stringify(data),
  });

// ── Watchlist ─────────────────────────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceEur: number;
  change: number;
  changePercent: number;
}

export const getWatchlist = () => request<WatchlistItem[]>("/api/watchlist");

export const addToWatchlist = (symbol: string, name: string) =>
  request("/api/watchlist", {
    method: "POST",
    body: JSON.stringify({ symbol, name }),
  });

export const removeFromWatchlist = (symbol: string) =>
  request(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });

// ── Alerts ────────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  symbol: string;
  name: string;
  condition: "ABOVE" | "BELOW";
  price: number;
  active: boolean;
  triggered: boolean;
  currentPrice?: number;
  createdAt: string;
}

export const getAlerts = () => request<Alert[]>("/api/alerts");

export const createAlert = (data: {
  symbol: string;
  name: string;
  condition: "ABOVE" | "BELOW";
  price: number;
}) =>
  request("/api/alerts", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteAlert = (id: string) =>
  request(`/api/alerts/${id}`, { method: "DELETE" });

export const patchAlert = (id: string, data: Partial<Alert>) =>
  request(`/api/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
