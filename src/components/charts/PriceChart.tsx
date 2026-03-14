"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";

interface PricePoint {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
}

interface PriceChartProps {
  data: PricePoint[];
  avgPrice?: number;
  period: string;
  onPeriodChange: (period: string) => void;
}

const PERIODS = ["1mo", "3mo", "6mo", "1y", "2y"];

function formatTooltipValue(value: number) {
  return `$${value.toFixed(2)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div
        className="border border-border rounded-lg p-3 text-xs mono"
        style={{ background: "#141b2d" }}
      >
        <p className="text-text-dim mb-2">{label}</p>
        <div className="space-y-1">
          <div className="flex gap-3">
            <span className="text-text-muted">Open</span>
            <span className="text-text">${d.open?.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-text-muted">High</span>
            <span className="text-gain">${d.high?.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-text-muted">Low</span>
            <span className="text-loss">${d.low?.toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-text-muted">Close</span>
            <span className="text-text font-bold">${d.close?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function PriceChart({
  data,
  avgPrice,
  period,
  onPeriodChange,
}: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted">
        Geen data beschikbaar
      </div>
    );
  }

  const firstPrice = data[0]?.close || 0;
  const lastPrice = data[data.length - 1]?.close || 0;
  const isPositive = lastPrice >= firstPrice;
  const color = isPositive ? "#00e676" : "#ff1744";

  const formattedData = data.map((d) => ({
    ...d,
    date: format(new Date(d.date), "dd MMM"),
  }));

  const minPrice = Math.min(...data.map((d) => d.low)) * 0.995;
  const maxPrice = Math.max(...data.map((d) => d.high)) * 1.005;

  return (
    <div>
      {/* Period selector */}
      <div className="flex gap-2 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              period === p
                ? "text-black font-bold"
                : "text-text-muted hover:text-text"
            }`}
            style={
              period === p
                ? { background: "#00d4ff" }
                : { background: "transparent" }
            }
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {avgPrice && avgPrice > 0 && (
            <ReferenceLine
              y={avgPrice}
              stroke="#ffd600"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Gemiddeld: $${avgPrice.toFixed(2)}`,
                fill: "#ffd600",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
