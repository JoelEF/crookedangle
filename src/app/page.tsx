"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Bell,
  Plus,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import SignalBadge from "@/components/ui/SignalBadge";
import PortfolioDonut from "@/components/charts/PortfolioDonut";
import clsx from "clsx";

interface PortfolioSummary {
  totalValue: number;
  totalValueEur: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  eurRate: number;
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  currentValueEur: number;
  pnl: number;
  pnlPercent: number;
  changePercent: number;
}

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceEur: number;
  changePercent: number;
}

const TOP_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL"];

export default function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [portfolioRes, watchlistRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/watchlist"),
      ]);
      const portfolio = await portfolioRes.json();
      const wl = await watchlistRes.json();

      setSummary(portfolio.summary);
      setHoldings(portfolio.holdings || []);
      setWatchlist(wl || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const donutData = holdings.map((h) => ({
    symbol: h.symbol,
    value: h.currentValueEur,
  }));

  const totalGainersLosers = holdings.reduce(
    (acc, h) => {
      if (h.changePercent > 0) acc.gainers++;
      else if (h.changePercent < 0) acc.losers++;
      return acc;
    },
    { gainers: 0, losers: 0 }
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">
            {lastUpdated
              ? `Bijgewerkt: ${lastUpdated.toLocaleTimeString("nl-NL")}`
              : "Laden..."}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:text-text text-sm transition-all"
            style={{ background: "#141b2d" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Vernieuwen
          </button>
          <Link
            href="/portfolio"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "#00d4ff" }}
          >
            <Plus size={14} />
            Aandeel toevoegen
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Portfolio waarde"
          value={`€${summary ? summary.totalValueEur.toFixed(2) : "0.00"}`}
          subValue={`$${summary ? summary.totalValue.toFixed(2) : "0.00"}`}
          icon={<DollarSign size={16} />}
          accentColor="#00d4ff"
        />
        <StatCard
          label="Totale P&L"
          value={`€${summary ? Math.abs(summary.totalPnl * (summary.eurRate || 0.92)).toFixed(2) : "0.00"}`}
          change={summary?.totalPnlPercent}
          icon={
            summary && summary.totalPnl >= 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )
          }
          accentColor={
            summary && summary.totalPnl >= 0 ? "#00e676" : "#ff1744"
          }
        />
        <StatCard
          label="Posities"
          value={holdings.length.toString()}
          subValue={`${totalGainersLosers.gainers} stijgers · ${totalGainersLosers.losers} dalers`}
          icon={<Activity size={16} />}
          accentColor="#ffd600"
        />
        <StatCard
          label="EUR/USD koers"
          value={`1 USD = €${summary ? summary.eurRate.toFixed(4) : "0.92"}`}
          subValue="Live wisselkoers"
          icon={<Bell size={16} />}
          accentColor="#e040fb"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Holdings table */}
        <div
          className="col-span-2 rounded-xl border border-border overflow-hidden"
          style={{ background: "#141b2d" }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold text-text">Mijn Posities</h2>
            <Link href="/portfolio" className="text-xs text-primary hover:underline">
              Beheer portfolio →
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-text-muted">Laden...</div>
          ) : holdings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-text-muted mb-4">Nog geen posities</p>
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-black text-sm font-medium"
                style={{ background: "#00d4ff" }}
              >
                <Plus size={14} /> Eerste aandeel toevoegen
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                      Aandeel
                    </th>
                    <th className="text-right px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                      Aandelen
                    </th>
                    <th className="text-right px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                      Waarde
                    </th>
                    <th className="text-right px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="text-right px-5 py-3 text-text-muted font-medium text-xs uppercase tracking-wider">
                      Dag %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {holdings.map((h) => (
                    <tr
                      key={h.id}
                      className="hover:bg-surface transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/stocks/${h.symbol}`}
                          className="flex items-center gap-2 group"
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-black"
                            style={{ background: "#00d4ff" }}
                          >
                            {h.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-text group-hover:text-primary transition-colors flex items-center gap-1">
                              {h.symbol}
                              <ExternalLink size={10} className="opacity-0 group-hover:opacity-50" />
                            </div>
                            <div className="text-text-muted text-xs truncate max-w-32">
                              {h.name}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-right mono text-text-dim">
                        {h.shares.toFixed(4)}
                      </td>
                      <td className="px-5 py-3 text-right mono text-text">
                        €{h.currentValueEur.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right mono">
                        <span className={h.pnl >= 0 ? "text-gain" : "text-loss"}>
                          {h.pnl >= 0 ? "+" : ""}
                          {h.pnlPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right mono">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-xs",
                            h.changePercent >= 0
                              ? "bg-gain/10 text-gain"
                              : "bg-loss/10 text-loss"
                          )}
                        >
                          {h.changePercent >= 0 ? "+" : ""}
                          {h.changePercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Portfolio allocation donut */}
        <div
          className="rounded-xl border border-border p-5"
          style={{ background: "#141b2d" }}
        >
          <h2 className="font-semibold text-text mb-4">Allocatie</h2>
          {donutData.length > 0 ? (
            <PortfolioDonut data={donutData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-text-muted text-sm">
              Geen posities
            </div>
          )}
        </div>
      </div>

      {/* Watchlist */}
      <div
        className="rounded-xl border border-border overflow-hidden"
        style={{ background: "#141b2d" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-text">Watchlist</h2>
          <Link href="/watchlist" className="text-xs text-primary hover:underline">
            Beheer watchlist →
          </Link>
        </div>
        {watchlist.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            <p>Voeg aandelen toe aan je watchlist</p>
            <Link href="/watchlist" className="text-primary text-xs mt-2 hover:underline block">
              Ga naar watchlist →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-5 divide-x divide-border">
            {watchlist.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/stocks/${item.symbol}`}
                className="p-4 hover:bg-surface transition-colors"
              >
                <div className="text-xs text-text-muted mb-1">{item.symbol}</div>
                <div className="font-bold text-text mono">€{item.priceEur.toFixed(2)}</div>
                <div
                  className={clsx(
                    "text-xs mono mt-1",
                    item.changePercent >= 0 ? "text-gain" : "text-loss"
                  )}
                >
                  {item.changePercent >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
