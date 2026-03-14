type Signal = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";

const SIGNAL_LABELS: Record<Signal, string> = {
  STRONG_BUY: "STERK KOPEN",
  BUY: "KOPEN",
  NEUTRAL: "NEUTRAAL",
  SELL: "VERKOPEN",
  STRONG_SELL: "STERK VERKOPEN",
};

const SIGNAL_CLASSES: Record<Signal, string> = {
  STRONG_BUY: "signal-strong-buy",
  BUY: "signal-buy",
  NEUTRAL: "signal-neutral",
  SELL: "signal-sell",
  STRONG_SELL: "signal-strong-sell",
};

export default function SignalBadge({ signal }: { signal: Signal }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider ${SIGNAL_CLASSES[signal]}`}
    >
      {SIGNAL_LABELS[signal]}
    </span>
  );
}
