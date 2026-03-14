"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, X, Search, TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

interface Holding {
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
}

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [formData, setFormData] = useState({ shares: "", avgPrice: "", date: "" });
  const [submitting, setSubmitting] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  async function fetchHoldings() {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      setHoldings(data.holdings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHoldings();
  }, []);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 1) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`);
      const results = await res.json();
      setSearchResults(results);
    }, 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStock || !formData.shares || !formData.avgPrice) return;
    setSubmitting(true);
    try {
      await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          shares: parseFloat(formData.shares),
          avgPrice: parseFloat(formData.avgPrice),
          date: formData.date,
        }),
      });
      setShowForm(false);
      setSelectedStock(null);
      setSearchQuery("");
      setFormData({ shares: "", avgPrice: "", date: "" });
      fetchHoldings();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, symbol: string) {
    if (!confirm(`Weet je zeker dat je ${symbol} wilt verwijderen?`)) return;
    await fetch(`/api/holdings/${id}`, { method: "DELETE" });
    fetchHoldings();
  }

  const totalValueEur = holdings.reduce((s, h) => s + h.currentValueEur, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const totalPnl = holdings.reduce((s, h) => s + h.pnl, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Portfolio</h1>
          <p className="text-text-muted text-sm mt-1">Beheer je aandelenposities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium hover:opacity-90"
          style={{ background: "#00d4ff" }}
        >
          <Plus size={16} />
          Aandeel kopen
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border p-5" style={{ background: "#141b2d" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-2">Portfolio waarde</div>
          <div className="text-2xl font-bold mono text-text">€{totalValueEur.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border p-5" style={{ background: "#141b2d" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-2">Totaal geïnvesteerd</div>
          <div className="text-2xl font-bold mono text-text">${totalCost.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-border p-5" style={{ background: "#141b2d" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-2">Totale P&L</div>
          <div className={clsx("text-2xl font-bold mono", totalPnl >= 0 ? "text-gain" : "text-loss")}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-2xl border border-border p-6" style={{ background: "#141b2d" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-text text-lg">Aandeel kopen</h2>
              <button onClick={() => { setShowForm(false); setSelectedStock(null); setSearchQuery(""); }}
                className="text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Stock search */}
              <div className="relative">
                <label className="text-xs text-text-muted block mb-2">Zoek aandeel</label>
                {selectedStock ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-primary" style={{ background: "#0a0e1a" }}>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                      {selectedStock.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text text-sm">{selectedStock.symbol}</div>
                      <div className="text-xs text-text-muted">{selectedStock.name}</div>
                    </div>
                    <button type="button" onClick={() => { setSelectedStock(null); setSearchQuery(""); }}
                      className="text-text-muted hover:text-text">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="AAPL, Apple Inc., ..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors"
                        style={{ background: "#0a0e1a" }}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 rounded-lg border border-border overflow-hidden" style={{ background: "#141b2d" }}>
                        {searchResults.map((r) => (
                          <button
                            key={r.symbol}
                            type="button"
                            onClick={() => { setSelectedStock(r); setSearchResults([]); setSearchQuery(""); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors text-left"
                          >
                            <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                              {r.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-text text-sm">{r.symbol}</div>
                              <div className="text-xs text-text-muted">{r.name} · {r.exchange}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-2">Aantal aandelen</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.shares}
                  onChange={(e) => setFormData((p) => ({ ...p, shares: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors mono"
                  style={{ background: "#0a0e1a" }}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-2">Aankoopprijs (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.avgPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, avgPrice: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors mono"
                  style={{ background: "#0a0e1a" }}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-text-muted block mb-2">Datum (optioneel)</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors"
                  style={{ background: "#0a0e1a" }}
                />
              </div>

              {formData.shares && formData.avgPrice && (
                <div className="p-3 rounded-lg border border-border text-sm" style={{ background: "#0a0e1a" }}>
                  <span className="text-text-muted">Totale investering: </span>
                  <span className="text-text font-bold mono">
                    ${(parseFloat(formData.shares) * parseFloat(formData.avgPrice)).toFixed(2)}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedStock || submitting}
                className="w-full py-3 rounded-lg font-medium text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                style={{ background: "#00d4ff" }}
              >
                {submitting ? "Toevoegen..." : "Aandeel toevoegen"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Holdings table */}
      <div className="rounded-xl border border-border overflow-hidden" style={{ background: "#141b2d" }}>
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold text-text">Posities ({holdings.length})</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-muted">Laden...</div>
        ) : holdings.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted mb-4">Nog geen posities in portfolio</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium"
              style={{ background: "#00d4ff" }}
            >
              <Plus size={14} /> Eerste aandeel kopen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Aandeel", "Aandelen", "Aankoopprijs", "Huidige prijs", "Waarde (EUR)", "P&L", "Dag %", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider last:text-right">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {holdings.map((h) => (
                  <tr key={h.id} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/stocks/${h.symbol}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                          {h.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-text group-hover:text-primary">{h.symbol}</div>
                          <div className="text-text-muted text-xs truncate max-w-40">{h.name}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4 mono text-text-dim">{h.shares.toFixed(4)}</td>
                    <td className="px-5 py-4 mono text-text-dim">${h.avgPrice.toFixed(2)}</td>
                    <td className="px-5 py-4 mono text-text">${h.currentPrice.toFixed(2)}</td>
                    <td className="px-5 py-4 mono text-text font-medium">€{h.currentValueEur.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className={clsx("mono font-medium", h.pnl >= 0 ? "text-gain" : "text-loss")}>
                        {h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                      </div>
                      <div className={clsx("text-xs mono", h.pnl >= 0 ? "text-gain" : "text-loss")}>
                        {h.pnl >= 0 ? "+" : ""}${h.pnl.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className={clsx("flex items-center gap-1 text-xs mono", h.changePercent >= 0 ? "text-gain" : "text-loss")}>
                        {h.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {h.changePercent >= 0 ? "+" : ""}{h.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/stocks/${h.symbol}`}
                          className="p-1.5 rounded hover:bg-border transition-colors text-text-muted hover:text-primary">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(h.id, h.symbol)}
                          className="p-1.5 rounded hover:bg-loss/10 transition-colors text-text-muted hover:text-loss">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
