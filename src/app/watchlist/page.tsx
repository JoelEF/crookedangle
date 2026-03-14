"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Star, Plus, Trash2, X, Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import clsx from "clsx";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceEur: number;
  change: number;
  changePercent: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
    const interval = setInterval(fetchWatchlist, 60000);
    return () => clearInterval(interval);
  }, []);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 1) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`);
      setSearchResults(await res.json());
    }, 400);
  }

  async function addToWatchlist(result: SearchResult) {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: result.symbol, name: result.name }),
    });
    setShowForm(false);
    setSearchQuery("");
    setSearchResults([]);
    fetchWatchlist();
  }

  async function removeFromWatchlist(symbol: string) {
    await fetch(`/api/watchlist?symbol=${symbol}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  }

  const gainers = items.filter((i) => i.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
  const losers = items.filter((i) => i.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <Star size={24} style={{ color: "#00d4ff" }} />
            Watchlist
          </h1>
          <p className="text-text-muted text-sm mt-1">{items.length} aandelen gevolgd</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchWatchlist} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text text-sm"
            style={{ background: "#141b2d" }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium"
            style={{ background: "#00d4ff" }}>
            <Plus size={16} /> Aandeel toevoegen
          </button>
        </div>
      </div>

      {/* Search modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-2xl border border-border p-6" style={{ background: "#141b2d" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text">Aandeel toevoegen</h2>
              <button onClick={() => { setShowForm(false); setSearchQuery(""); setSearchResults([]); }}
                className="text-text-muted hover:text-text"><X size={20} /></button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Zoek op naam of symbool..."
                className="w-full pl-9 pr-4 py-3 rounded-lg border border-border text-text text-sm outline-none focus:border-primary"
                style={{ background: "#0a0e1a" }} autoFocus />
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-lg border border-border overflow-hidden" style={{ background: "#0a0e1a" }}>
                {searchResults.map((r) => (
                  <button key={r.symbol} onClick={() => addToWatchlist(r)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors text-left">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                      {r.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-text text-sm">{r.symbol}</div>
                      <div className="text-xs text-text-muted">{r.name} · {r.exchange}</div>
                    </div>
                    <Plus size={16} className="ml-auto text-text-muted" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="text-center py-16 text-text-muted">Laden...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border" style={{ background: "#141b2d" }}>
          <Star size={48} className="mx-auto mb-4 text-text-muted/30" />
          <p className="text-text-muted mb-4">Watchlist is leeg</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium"
            style={{ background: "#00d4ff" }}>
            <Plus size={14} /> Aandeel toevoegen
          </button>
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-gain/20 p-4" style={{ background: "rgba(0,230,118,0.04)" }}>
              <div className="text-xs text-gain/70 uppercase tracking-widest mb-2">Top stijger vandaag</div>
              {gainers[0] ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">{gainers[0].symbol}</span>
                  <span className="text-gain mono font-bold">+{gainers[0].changePercent.toFixed(2)}%</span>
                </div>
              ) : <span className="text-text-muted text-sm">Geen</span>}
            </div>
            <div className="rounded-xl border border-loss/20 p-4" style={{ background: "rgba(255,23,68,0.04)" }}>
              <div className="text-xs text-loss/70 uppercase tracking-widest mb-2">Top daler vandaag</div>
              {losers[0] ? (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">{losers[0].symbol}</span>
                  <span className="text-loss mono font-bold">{losers[0].changePercent.toFixed(2)}%</span>
                </div>
              ) : <span className="text-text-muted text-sm">Geen</span>}
            </div>
          </div>

          {/* Watchlist grid */}
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id}
                className="rounded-xl border border-border p-4 hover:border-primary/30 transition-all group"
                style={{ background: "#141b2d" }}>
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/stocks/${item.symbol}`} className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-text group-hover:text-primary transition-colors">{item.symbol}</div>
                      <div className="text-xs text-text-muted truncate max-w-24">{item.name}</div>
                    </div>
                  </Link>
                  <button onClick={() => removeFromWatchlist(item.symbol)}
                    className="text-text-muted hover:text-loss p-1 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="mono">
                  <div className="text-xl font-bold text-text">€{item.priceEur.toFixed(2)}</div>
                  <div className="text-sm text-text-muted">${item.price.toFixed(2)}</div>
                  <div className={clsx("flex items-center gap-1.5 mt-2 text-sm font-medium", item.changePercent >= 0 ? "text-gain" : "text-loss")}>
                    {item.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                    <span className="text-text-muted font-normal">
                      ({item.change >= 0 ? "+" : ""}${item.change.toFixed(2)})
                    </span>
                  </div>
                </div>

                <Link href={`/stocks/${item.symbol}`}
                  className="mt-3 w-full py-1.5 rounded text-xs text-center text-text-muted hover:text-primary border border-border hover:border-primary/30 transition-all block">
                  Bekijk analyse →
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
