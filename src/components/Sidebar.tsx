"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Bell,
  Star,
  Activity,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/portfolio", icon: Briefcase, label: "Portfolio" },
  { href: "/signals", icon: Activity, label: "AI Signalen" },
  { href: "/watchlist", icon: Star, label: "Watchlist" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col border-r border-border z-50"
      style={{ background: "#0a0e1a" }}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00d4ff, #0099bb)" }}>
            <TrendingUp size={16} className="text-black" />
          </div>
          <div>
            <h1 className="font-bold text-text text-sm tracking-wider">TRADING</h1>
            <p className="text-xs" style={{ color: "#00d4ff" }}>TRACKER PRO</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "text-white"
                  : "text-text-muted hover:text-text-dim"
              )}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,153,187,0.08))",
                      borderLeft: "2px solid #00d4ff",
                    }
                  : {}
              }
            >
              <Icon
                size={18}
                style={{ color: active ? "#00d4ff" : undefined }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-muted text-center">
          Live data · Yahoo Finance
        </p>
        <p className="text-xs text-text-muted text-center mt-1">
          AI · Claude by Anthropic
        </p>
      </div>
    </aside>
  );
}
