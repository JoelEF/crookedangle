"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface PortfolioItem {
  symbol: string;
  value: number;
}

const COLORS = [
  "#00d4ff", "#00e676", "#ffd600", "#ff6d00", "#e040fb",
  "#2979ff", "#00bfa5", "#ff1744", "#69f0ae", "#40c4ff",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const d = payload[0];
    return (
      <div
        className="border border-border rounded-lg p-3 text-xs"
        style={{ background: "#141b2d" }}
      >
        <p className="font-bold text-text">{d.name}</p>
        <p className="text-text-muted mt-1">
          €{d.value.toFixed(2)} ({d.payload.percent?.toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function PortfolioDonut({ data }: { data: PortfolioItem[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const withPercent = data.map((d) => ({
    ...d,
    percent: (d.value / total) * 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={withPercent}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="symbol"
        >
          {withPercent.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-text-dim">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
