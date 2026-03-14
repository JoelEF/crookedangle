"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, RefreshCw, Search, Plus, ExternalLink } from "lucide-react";
import SignalBadge from "@/components/ui/SignalBadge";
import clsx from "clsx";

interface StockSignal {
  symbol: string;
  name: string;
  price: number;
  priceEur: number;
  changePercent: number;
  signal: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  score: number;
  rsi: number;
  macd: number;
  sma20: number;
  sma50: number;
}

const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AMD", "ASML", "ADBE"];

export default function SignalsPage() {
  const [signals, setSignals] = useState<StockSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSignal, setFilterSignal] = useState<string>("ALL");
  const [customSymbol, setCustomSymbol] = useState("");
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
  const [loadingStatus, setLoadingStatus] = useState("");

  async function fetchSignals(symList: string[]) {
    setLoading(true);
    const results: StockSignal[] = [];

    for (const sym of symList) {
      setLoadingStatus(`Laden: ${sym}`);
      try {
        const [quoteRes, histRes] = await Promise.all([
          fetch(`/api/stocks/${sym}`),
          fetch(`/api/stocks/${sym}/history?period=3mo`),
        ]);
        const quote = await quoteRes.json();
        const hist = await histRes.json();

        if (quote.price && hist.indicators) {
          results.push({
            symbol: sym,
            name: quote.name,
            price: quote.price,
            priceEur: quote.price * (quote.eurRate || 0.92),
            changePercent: quote.changePercent,
            signal: hist.indicators.signal,
            score: hist.indicators.score,
            rsi: hist.indicators.rsi,
            macd: hist.indicators.macd.value,
            sma20: hist.indicators.sma20,
            sma50: hist.indicators.sma50,
          });
        }
      } catch {
        // skip failed symbols
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    setSignals(results);
    setLoadingStatus("");
    setLoading(false);
  }

  useEffect(() => {
    fetchSignals(symbols);
  }, []);

  function addCustomSymbol() {
    const sym = customSymbol.toUpperCase().trim();
    if (!sym || symbols.includes(sym)) return;
    const newSymbols = [...symbols, sym];
    setSymbols(newSymbols);
    setCustomSymbol("");
    fetchSignals(newSymbols);
  }

  const filtered = filterSignal === "ALL"
    ? signals
    : signals.filter((s) => s.signal === filterSignal);

  const buySignals = signals.filter((s) => s.signal === "STRONG_BUY" || s.signal === "BUY");
  const sellSignals = signals.filter((s) => s.signal === "STRONG_SELL" || s.signal === "SELL");

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <Activity size={24} style={{ color: "#00d4ff" }} />
            AI Investeer Signalen
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Technische analyse van {signals.length} aandelen
          </p>
        </div>
        <button
          onClick={() => fetchSignals(symbols)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text text-sm transition-all"
          style={{ background: "#141b2d" }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Vernieuwen
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gain/20 p-4" style={{ background: "rgba(0,230,118,0.05)" }}>
          <div className="text-xs text-gain/70 uppercase tracking-widest mb-1">Sterk kopen</div>
          <div className="text-2xl font-bold text-gain mono">
            {signals.filter((s) => s.signal === "STRONG_BUY").length}
          </div>
        </div>
        <div className="rounded-xl border border-gain/10 p-4" style={{ background: "rgba(0,200,100,0.04)" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Kopen</div>
          <div className="text-2xl font-bold mono" style={{ color: "#00c864" }}>
            {signals.filter((s) => s.signal === "BUY").length}
          </div>
        </div>
        <div className="rounded-xl border border-loss/10 p-4" style={{ background: "rgba(255,23,68,0.04)" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Verkopen</div>
          <div className="text-2xl font-bold mono" style={{ color: "#ff6432" }}>
            {signals.filter((s) => s.signal === "SELL").length}
          </div>
        </div>
        <div className="rounded-xl border border-loss/20 p-4" style={{ background: "rgba(255,23,68,0.05)" }}>
          <div className="text-xs text-loss/70 uppercase tracking-widest mb-1">Sterk verkopen</div>
          <div className="text-2xl font-bold text-loss mono">
            {signals.filter((s) => s.signal === "STRONG_SELL").length}
          </div>
        </div>
      </div>

      {/* Add symbol + filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={customSymbol}
            onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addCustomSymbol()}
            placeholder="Voeg symbool toe (bv. ASML)"
            className="px-4 py-2 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors w-56"
            style={{ background: "#141b2d" }}
          />
          <button
            onClick={addCustomSymbol}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-black text-sm font-medium"
            style={{ background: "#00d4ff" }}
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex gap-2 ml-auto flex-wrap">
          {["ALL", "STRONG_BUY", "BUY", "NEUTRAL", "SELL", "STRONG_SELL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterSignal(f)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                filterSignal === f
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border text-text-muted hover:text-text"
              )}
              style={{ background: filterSignal !== f ? "#141b2d" : undefined }}
            >
              {f === "ALL" ? "Alle" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-border p-8 text-center" style={{ background: "#141b2d" }}>
          <div className="flex items-center justify-center gap-3 text-text-muted">
            <RefreshCw size={18} className="animate-spin" />
            <span>{loadingStatus || "Signalen berekenen..."}</span>
          </div>
          <p className="text-xs text-text-muted mt-2">Dit kan even duren. Data wordt opgehaald van Yahoo Finance.</p>
        </div>
      )}

      {/* Signals table */}
      {!loading && (
        <div className="rounded-xl border border-border overflow-hidden" style={{ background: "#141b2d" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Rang", "Aandeel", "Prijs (EUR)", "Dag %", "Signaal", "Score", "RSI", "MACD", "SMA20 vs Prijs", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s, i) => {
                const priceVsSma20 = s.sma20 > 0 ? ((s.price - s.sma20) / s.sma20) * 100 : 0;
                return (
                  <tr key={s.symbol} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <span className="text-text-muted mono text-xs">#{i + 1}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                          {s.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-text">{s.symbol}</div>
                          <div className="text-text-muted text-xs truncate max-w-32">{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 mono text-text">€{s.priceEur.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={clsx("mono text-sm", s.changePercent >= 0 ? "text-gain" : "text-loss")}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <SignalBadge signal={s.signal} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: "#1e2d4a" }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.abs(s.score))}%`,
                              background: s.score > 0 ? "#00e676" : "#ff1744",
                            }}
                          />
                        </div>
                        <span className={clsx("mono text-xs", s.score > 0 ? "text-gain" : s.score < 0 ? "text-loss" : "text-text-muted")}>
                          {s.score > 0 ? "+" : ""}{s.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 mono text-sm">
                      <span className={s.rsi < 30 ? "text-gain" : s.rsi > 70 ? "text-loss" : "text-text-dim"}>
                        {s.rsi.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 mono text-sm">
                      <span className={s.macd > 0 ? "text-gain" : "text-loss"}>
                        {s.macd.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-5 py-4 mono text-sm">
                      <span className={priceVsSma20 > 0 ? "text-gain" : "text-loss"}>
                        {priceVsSma20 > 0 ? "+" : ""}{priceVsSma20.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/stocks/${s.symbol}`}
                        className="p-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-primary inline-flex">
                        <ExternalLink size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="p-8 text-center text-text-muted">Geen signalen gevonden</div>
          )}
        </div>
      )}
    </div>
  );
}
