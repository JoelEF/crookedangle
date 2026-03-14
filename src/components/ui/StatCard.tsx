import clsx from "clsx";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  icon?: ReactNode;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  subValue,
  change,
  icon,
  accentColor = "#00d4ff",
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className="rounded-xl p-5 border border-border"
      style={{ background: "#141b2d" }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-widest">
          {label}
        </span>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accentColor}18` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="font-bold text-2xl text-text mono">{value}</div>
      {subValue && <div className="text-sm text-text-muted mt-1">{subValue}</div>}
      {change !== undefined && (
        <div
          className={clsx(
            "text-sm font-medium mt-2 mono",
            isPositive ? "text-gain" : "text-loss"
          )}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </div>
      )}
    </div>
  );
}
