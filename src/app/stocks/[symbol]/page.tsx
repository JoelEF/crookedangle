"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, StarOff, Brain, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import Link from "next/link";
import PriceChart from "@/components/charts/PriceChart";
import SignalBadge from "@/components/ui/SignalBadge";
import clsx from "clsx";

interface StockQuote {
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

interface HistoricalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TechnicalIndicators {
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

interface AIAnalysis {
  summary: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendation: string;
  confidenceScore: number;
}

function RSIGauge({ rsi }: { rsi: number }) {
  const color = rsi < 30 ? "#00e676" : rsi > 70 ? "#ff1744" : "#ffd600";
  const rotation = (rsi / 100) * 180 - 90;
  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="100" height="60" viewBox="0 0 100 60">
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#1e2d4a" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 55 A 40 40 0 0 1 90 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(rsi / 100) * 125.6} 125.6`}
          />
          <text x="50" y="52" textAnchor="middle" fill={color} fontSize="14" fontWeight="bold" fontFamily="monospace">
            {rsi.toFixed(0)}
          </text>
        </svg>
      </div>
      <div className="text-xs text-text-muted mt-1">RSI</div>
      <div className="text-xs mt-0.5" style={{ color }}>
        {rsi < 30 ? "Oversold" : rsi > 70 ? "Overbought" : "Neutraal"}
      </div>
    </div>
  );
}

export default function StockPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [historical, setHistorical] = useState<HistoricalPoint[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [period, setPeriod] = useState("3mo");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    fetchHistory();
  }, [symbol, period]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}`);
      const data = await res.json();
      setQuote(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHistory() {
    const res = await fetch(`/api/stocks/${symbol}/history?period=${period}`);
    const data = await res.json();
    setHistorical(data.historical || []);
    setIndicators(data.indicators || null);
  }

  async function analyzeWithAI() {
    if (!quote || !indicators) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          name: quote.name,
          price: quote.price,
          changePercent: quote.changePercent,
          technicalSignal: indicators.signal,
          technicalScore: indicators.score,
          rsi: indicators.rsi,
          pe: quote.pe,
          marketCap: quote.marketCap,
        }),
      });
      const analysis = await res.json();
      setAiAnalysis(analysis);
    } finally {
      setAiLoading(false);
    }
  }

  async function toggleWatchlist() {
    if (inWatchlist) {
      await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name: quote?.name }),
      });
    }
    setInWatchlist(!inWatchlist);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="text-text-muted">Laden...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-muted">Aandeel niet gevonden: {symbol}</p>
        <Link href="/" className="text-primary text-sm mt-2 hover:underline block">← Terug naar dashboard</Link>
      </div>
    );
  }

  const eurPrice = quote.price * quote.eurRate;
  const isPositive = quote.changePercent >= 0;

  const sentimentColors = {
    BULLISH: "#00e676",
    BEARISH: "#ff1744",
    NEUTRAL: "#ffd600",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <Link href="/" className="text-text-muted hover:text-text mt-1">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black" style={{ background: "#00d4ff" }}>
                {quote.symbol.slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">{quote.symbol}</h1>
                <p className="text-text-muted text-sm">{quote.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleWatchlist}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-text transition-all"
            style={{ background: "#141b2d" }}>
            {inWatchlist ? <StarOff size={16} /> : <Star size={16} />}
            {inWatchlist ? "Verwijderen" : "Watchlist"}
          </button>
          <button onClick={analyzeWithAI} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium disabled:opacity-60"
            style={{ background: "#00d4ff" }}>
            <Brain size={16} />
            {aiLoading ? "Analyseren..." : "AI Analyse"}
          </button>
        </div>
      </div>

      {/* Price hero */}
      <div className="rounded-2xl border border-border p-6 mb-6" style={{ background: "#141b2d" }}>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-4xl font-bold mono text-text">€{eurPrice.toFixed(2)}</div>
            <div className="text-lg text-text-muted mono">${quote.price.toFixed(2)} USD</div>
            <div className={clsx("flex items-center gap-2 mt-2", isPositive ? "text-gain" : "text-loss")}>
              {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-semibold mono">
                {isPositive ? "+" : ""}{quote.change.toFixed(2)} ({isPositive ? "+" : ""}{quote.changePercent.toFixed(2)}%)
              </span>
              <span className="text-text-muted text-sm">vandaag</span>
            </div>
          </div>

          {indicators && (
            <div className="flex items-center gap-6">
              <RSIGauge rsi={indicators.rsi} />
              <div className="text-center">
                <SignalBadge signal={indicators.signal} />
                <div className="text-xs text-text-muted mt-2">Score: {indicators.score}/100</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="col-span-2 rounded-xl border border-border p-5" style={{ background: "#141b2d" }}>
          <h2 className="font-semibold text-text mb-4 flex items-center gap-2">
            <BarChart2 size={18} style={{ color: "#00d4ff" }} />
            Koersgrafiek
          </h2>
          <PriceChart
            data={historical}
            period={period}
            onPeriodChange={setPeriod}
          />
        </div>

        {/* Stock info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border p-4" style={{ background: "#141b2d" }}>
            <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3">Statistieken</h3>
            <div className="space-y-2 text-sm">
              {[
                ["52w Hoog", `$${quote.high52w.toFixed(2)}`],
                ["52w Laag", `$${quote.low52w.toFixed(2)}`],
                ["Volume", quote.volume > 1e6 ? `${(quote.volume / 1e6).toFixed(1)}M` : quote.volume.toLocaleString()],
                ["Marktcap", quote.marketCap > 1e12 ? `$${(quote.marketCap / 1e12).toFixed(2)}T` : quote.marketCap > 1e9 ? `$${(quote.marketCap / 1e9).toFixed(1)}B` : `$${(quote.marketCap / 1e6).toFixed(0)}M`],
                ["P/E ratio", quote.pe > 0 ? quote.pe.toFixed(1) : "N/A"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-text-muted">{label}</span>
                  <span className="mono text-text">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical indicators */}
          {indicators && (
            <div className="rounded-xl border border-border p-4" style={{ background: "#141b2d" }}>
              <h3 className="text-xs text-text-muted uppercase tracking-widest mb-3">Technische Indicatoren</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["MACD", indicators.macd.value.toFixed(3), indicators.macd.value > 0 ? "gain" : "loss"],
                  ["MACD Signaal", indicators.macd.signal.toFixed(3), "neutral"],
                  ["SMA 20", `$${indicators.sma20.toFixed(2)}`, indicators.sma20 > 0 && quote.price > indicators.sma20 ? "gain" : "loss"],
                  ["SMA 50", `$${indicators.sma50.toFixed(2)}`, indicators.sma50 > 0 && quote.price > indicators.sma50 ? "gain" : "loss"],
                  ["Stoch %K", indicators.stochastic.k.toFixed(1), indicators.stochastic.k < 20 ? "gain" : indicators.stochastic.k > 80 ? "loss" : "neutral"],
                  ["BB Upper", `$${indicators.bollingerBands.upper.toFixed(2)}`, "neutral"],
                  ["BB Lower", `$${indicators.bollingerBands.lower.toFixed(2)}`, "neutral"],
                ].map(([label, value, color]) => (
                  <div key={label as string} className="flex justify-between items-center">
                    <span className="text-text-muted">{label}</span>
                    <span className={clsx("mono", color === "gain" ? "text-gain" : color === "loss" ? "text-loss" : "text-text-dim")}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="rounded-xl border border-border p-6" style={{ background: "#141b2d" }}>
          <div className="flex items-center gap-3 mb-5">
            <Brain size={20} style={{ color: "#00d4ff" }} />
            <h2 className="font-semibold text-text">Claude AI Analyse</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${sentimentColors[aiAnalysis.sentiment]}18`,
                color: sentimentColors[aiAnalysis.sentiment],
                border: `1px solid ${sentimentColors[aiAnalysis.sentiment]}44`,
              }}
            >
              {aiAnalysis.sentiment}
            </span>
            <span className="ml-auto text-xs text-text-muted">
              Vertrouwen: {aiAnalysis.confidenceScore}%
            </span>
          </div>

          <p className="text-text-dim mb-5 leading-relaxed">{aiAnalysis.summary}</p>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2">Kernpunten</h3>
              <ul className="space-y-1.5">
                {aiAnalysis.keyPoints.map((p, i) => (
                  <li key={i} className="text-sm text-text-dim flex gap-2">
                    <span style={{ color: "#00d4ff" }}>•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2">Kansen</h3>
              <ul className="space-y-1.5">
                {aiAnalysis.opportunities.map((p, i) => (
                  <li key={i} className="text-sm text-gain flex gap-2">
                    <span>+</span> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2">Risico&apos;s</h3>
              <ul className="space-y-1.5">
                {aiAnalysis.risks.map((p, i) => (
                  <li key={i} className="text-sm text-loss flex gap-2">
                    <span>-</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-lg border-l-2 border-primary" style={{ background: "#0a0e1a" }}>
            <span className="text-xs text-text-muted uppercase tracking-widest block mb-1">Aanbeveling</span>
            <p className="text-text font-medium">{aiAnalysis.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
