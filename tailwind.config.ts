import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        surface: "#0f1629",
        card: "#141b2d",
        border: "#1e2d4a",
        "border-light": "#243352",
        primary: "#00d4ff",
        "primary-dark": "#0099bb",
        gain: "#00e676",
        "gain-dark": "#00b852",
        loss: "#ff1744",
        "loss-dark": "#cc0033",
        warning: "#ffd600",
        text: "#e2e8f0",
        "text-muted": "#64748b",
        "text-dim": "#94a3b8",
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
