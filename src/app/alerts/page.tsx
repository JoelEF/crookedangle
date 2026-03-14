"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Plus, Trash2, X, Search, CheckCircle, Clock, BellOff } from "lucide-react";
import clsx from "clsx";

interface Alert {
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

interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  async function fetchAlerts() {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 120000); // check every 2 minutes
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStock || !targetPrice) return;
    setSubmitting(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          condition,
          price: parseFloat(targetPrice),
        }),
      });
      setShowForm(false);
      setSelectedStock(null);
      setSearchQuery("");
      setTargetPrice("");
      fetchAlerts();
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function toggleAlert(id: string, active: boolean) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchAlerts();
  }

  async function resetAlert(id: string) {
    await fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ triggered: false }),
    });
    fetchAlerts();
  }

  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const activeAlerts = alerts.filter((a) => a.active && !a.triggered);
  const inactiveAlerts = alerts.filter((a) => !a.active && !a.triggered);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-3">
            <Bell size={24} style={{ color: "#00d4ff" }} />
            Prijs Alerts
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Ontvang meldingen bij prijswijzigingen
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium hover:opacity-90"
          style={{ background: "#00d4ff" }}
        >
          <Plus size={16} /> Alert aanmaken
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-border p-4" style={{ background: "#141b2d" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Actieve alerts</div>
          <div className="text-2xl font-bold mono" style={{ color: "#00d4ff" }}>{activeAlerts.length}</div>
        </div>
        <div className="rounded-xl border border-gain/20 p-4" style={{ background: "rgba(0,230,118,0.04)" }}>
          <div className="text-xs text-gain/70 uppercase tracking-widest mb-1">Getriggerd</div>
          <div className="text-2xl font-bold mono text-gain">{triggeredAlerts.length}</div>
        </div>
        <div className="rounded-xl border border-border p-4" style={{ background: "#141b2d" }}>
          <div className="text-xs text-text-muted uppercase tracking-widest mb-1">Inactief</div>
          <div className="text-2xl font-bold mono text-text-muted">{inactiveAlerts.length}</div>
        </div>
      </div>

      {/* Add Alert Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full max-w-md rounded-2xl border border-border p-6" style={{ background: "#141b2d" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-text text-lg">Nieuwe Alert</h2>
              <button onClick={() => { setShowForm(false); setSelectedStock(null); setSearchQuery(""); }}
                className="text-text-muted hover:text-text">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Stock search */}
              <div className="relative">
                <label className="text-xs text-text-muted block mb-2">Aandeel</label>
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
                      className="text-text-muted hover:text-text"><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Zoek aandeel..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors"
                        style={{ background: "#0a0e1a" }} />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 rounded-lg border border-border overflow-hidden" style={{ background: "#141b2d" }}>
                        {searchResults.map((r) => (
                          <button key={r.symbol} type="button"
                            onClick={() => { setSelectedStock(r); setSearchResults([]); setSearchQuery(""); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors text-left">
                            <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-black" style={{ background: "#00d4ff" }}>
                              {r.symbol.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-text text-sm">{r.symbol}</div>
                              <div className="text-xs text-text-muted">{r.name}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs text-text-muted block mb-2">Conditie</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setCondition("ABOVE")}
                    className={clsx("py-2.5 rounded-lg text-sm font-medium transition-all border",
                      condition === "ABOVE" ? "border-gain text-gain bg-gain/10" : "border-border text-text-muted"
                    )} style={{ background: condition !== "ABOVE" ? "#0a0e1a" : undefined }}>
                    ↑ Boven prijs
                  </button>
                  <button type="button" onClick={() => setCondition("BELOW")}
                    className={clsx("py-2.5 rounded-lg text-sm font-medium transition-all border",
                      condition === "BELOW" ? "border-loss text-loss bg-loss/10" : "border-border text-text-muted"
                    )} style={{ background: condition !== "BELOW" ? "#0a0e1a" : undefined }}>
                    ↓ Onder prijs
                  </button>
                </div>
              </div>

              {/* Target price */}
              <div>
                <label className="text-xs text-text-muted block mb-2">Doelprijs (USD)</label>
                <input type="number" step="0.01" min="0" value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-text text-sm outline-none focus:border-primary transition-colors mono"
                  style={{ background: "#0a0e1a" }} required />
              </div>

              <button type="submit" disabled={!selectedStock || submitting}
                className="w-full py-3 rounded-lg font-medium text-black disabled:opacity-50 hover:opacity-90"
                style={{ background: "#00d4ff" }}>
                {submitting ? "Aanmaken..." : "Alert aanmaken"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Alerts list */}
      {loading ? (
        <div className="text-center py-16 text-text-muted">Laden...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border" style={{ background: "#141b2d" }}>
          <Bell size={48} className="mx-auto mb-4 text-text-muted/30" />
          <p className="text-text-muted mb-4">Nog geen alerts aangemaakt</p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium"
            style={{ background: "#00d4ff" }}>
            <Plus size={14} /> Eerste alert aanmaken
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Triggered */}
          {triggeredAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gain mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> Getriggerd ({triggeredAlerts.length})
              </h2>
              {triggeredAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onDelete={deleteAlert} onToggle={toggleAlert} onReset={resetAlert} />
              ))}
            </div>
          )}

          {/* Active */}
          {activeAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-dim mb-3 flex items-center gap-2">
                <Clock size={16} /> Actief ({activeAlerts.length})
              </h2>
              {activeAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onDelete={deleteAlert} onToggle={toggleAlert} onReset={resetAlert} />
              ))}
            </div>
          )}

          {/* Inactive */}
          {inactiveAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-muted mb-3 flex items-center gap-2">
                <BellOff size={16} /> Inactief ({inactiveAlerts.length})
              </h2>
              {inactiveAlerts.map((alert) => (
                <AlertRow key={alert.id} alert={alert} onDelete={deleteAlert} onToggle={toggleAlert} onReset={resetAlert} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  onDelete,
  onToggle,
  onReset,
}: {
  alert: Alert;
  onDelete: (id: string) => void;
  onToggle: (id: string, active: boolean) => void;
  onReset: (id: string) => void;
}) {
  const progress = alert.currentPrice && alert.price
    ? Math.min(100, (alert.currentPrice / alert.price) * 100)
    : 0;

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 mb-2 transition-all",
        alert.triggered
          ? "border-gain/30 bg-gain/5"
          : !alert.active
          ? "border-border opacity-60"
          : "border-border"
      )}
      style={{ background: alert.triggered ? undefined : "#141b2d" }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-black flex-shrink-0" style={{ background: "#00d4ff" }}>
          {alert.symbol.slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-text">{alert.symbol}</span>
            <span className="text-xs text-text-muted truncate">{alert.name}</span>
            {alert.triggered && (
              <span className="text-xs px-2 py-0.5 rounded-full text-gain border border-gain/30 bg-gain/10">
                Getriggerd!
              </span>
            )}
          </div>
          <div className="text-sm text-text-muted">
            <span className={alert.condition === "ABOVE" ? "text-gain" : "text-loss"}>
              {alert.condition === "ABOVE" ? "↑ Boven" : "↓ Onder"}
            </span>
            {" "}
            <span className="mono font-medium text-text">${alert.price.toFixed(2)}</span>
            {alert.currentPrice && (
              <span className="ml-2 text-text-muted">· Nu: <span className="mono text-text">${alert.currentPrice.toFixed(2)}</span></span>
            )}
          </div>

          {/* Progress bar */}
          {alert.currentPrice && !alert.triggered && (
            <div className="mt-2 w-full h-1 rounded-full" style={{ background: "#1e2d4a" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (alert.currentPrice / alert.price) * 100)}%`,
                  background: alert.condition === "ABOVE" ? "#00e676" : "#ff1744",
                }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {alert.triggered && (
            <button onClick={() => onReset(alert.id)}
              className="text-xs px-3 py-1.5 rounded border border-border text-text-muted hover:text-text transition-all"
              style={{ background: "#0a0e1a" }}>
              Reset
            </button>
          )}
          <button onClick={() => onToggle(alert.id, alert.active)}
            className={clsx(
              "w-8 h-4 rounded-full transition-all relative flex-shrink-0",
              alert.active ? "bg-primary" : "bg-border"
            )}>
            <div className={clsx(
              "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
              alert.active ? "left-4" : "left-0.5"
            )} />
          </button>
          <button onClick={() => onDelete(alert.id)}
            className="p-1.5 rounded hover:bg-loss/10 transition-colors text-text-muted hover:text-loss">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
