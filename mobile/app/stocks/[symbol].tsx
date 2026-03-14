import { useEffect, useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { getStockQuote, getStockHistory, analyzeStock, addToWatchlist, removeFromWatchlist, StockQuote, HistoricalPoint, TechnicalIndicators, AIAnalysis } from "@/lib/api";
import { colors, SIGNAL_COLORS } from "@/lib/colors";
import SignalBadge from "@/components/ui/SignalBadge";
import PnlText from "@/components/ui/PnlText";

const PERIODS = ["1mo", "3mo", "6mo", "1y", "2y"];
const { width } = Dimensions.get("window");
const CHART_W = width - 32;
const CHART_H = 180;

function MiniLineChart({ data }: { data: HistoricalPoint[] }) {
  if (data.length < 2) return null;

  const prices = data.map((d) => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const isPositive = prices[prices.length - 1] >= prices[0];
  const color = isPositive ? colors.gain : colors.loss;

  // Build SVG polyline points
  const points = prices.map((p, i) => {
    const x = (i / (prices.length - 1)) * CHART_W;
    const y = CHART_H - ((p - min) / range) * CHART_H;
    return `${x},${y}`;
  }).join(" ");

  const { Svg, Polyline, Defs, LinearGradient, Stop, Polygon } = require("react-native-svg");

  // Fill polygon (close shape to bottom)
  const fillPoints = [
    `0,${CHART_H}`,
    ...prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * CHART_W;
      const y = CHART_H - ((p - min) / range) * CHART_H;
      return `${x},${y}`;
    }),
    `${CHART_W},${CHART_H}`,
  ].join(" ");

  return (
    <Svg width={CHART_W} height={CHART_H} style={{ marginVertical: 8 }}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.3} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Polygon points={fillPoints} fill="url(#grad)" />
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const navigation = useNavigation();

  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<HistoricalPoint[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [period, setPeriod] = useState("3mo");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (symbol) navigation.setOptions({ title: symbol });
  }, [symbol, navigation]);

  const fetchQuote = useCallback(async () => {
    if (!symbol) return;
    try {
      const q = await getStockQuote(symbol);
      setQuote(q);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const fetchHistory = useCallback(async () => {
    if (!symbol) return;
    try {
      const data = await getStockHistory(symbol, period);
      setHistory(data.historical);
      setIndicators(data.indicators);
    } catch { /* skip */ }
  }, [symbol, period]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function handleAIAnalyze() {
    if (!quote || !indicators) return;
    setAiLoading(true);
    try {
      const analysis = await analyzeStock({
        symbol: symbol!,
        name: quote.name,
        price: quote.price,
        changePercent: quote.changePercent,
        technicalSignal: indicators.signal,
        technicalScore: indicators.score,
        rsi: indicators.rsi,
        pe: quote.pe,
        marketCap: quote.marketCap,
      });
      setAiAnalysis(analysis);
    } finally {
      setAiLoading(false);
    }
  }

  async function toggleWatchlist() {
    if (!quote) return;
    if (inWatchlist) {
      await removeFromWatchlist(symbol!);
    } else {
      await addToWatchlist(symbol!, quote.name);
    }
    setInWatchlist(!inWatchlist);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }
  if (!quote) {
    return <View style={styles.center}><Text style={{ color: colors.textMuted }}>Aandeel niet gevonden</Text></View>;
  }

  const eurPrice = quote.price * quote.eurRate;
  const sentimentColor = aiAnalysis
    ? { BULLISH: colors.gain, BEARISH: colors.loss, NEUTRAL: colors.warning }[aiAnalysis.sentiment]
    : colors.textMuted;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Price hero */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroSymbol}>{quote.symbol}</Text>
            <Text style={styles.heroName} numberOfLines={1}>{quote.name}</Text>
          </View>
          <TouchableOpacity style={styles.watchlistBtn} onPress={toggleWatchlist}>
            <Text style={{ fontSize: 20 }}>{inWatchlist ? "⭐" : "☆"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroPrice}>€{eurPrice.toFixed(2)}</Text>
        <Text style={styles.heroUsd}>${quote.price.toFixed(2)} USD</Text>
        <PnlText
          value={quote.changePercent}
          suffix="%"
          style={styles.heroChange}
        />
        {indicators && (
          <View style={styles.signalRow}>
            <SignalBadge signal={indicators.signal} />
            <Text style={styles.scoreText}>Score: {indicators.score}/100</Text>
          </View>
        )}
      </View>

      {/* Chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Koersgrafiek</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {history.length > 0 ? (
          <MiniLineChart data={history} />
        ) : (
          <View style={styles.chartPlaceholder}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Statistieken</Text>
        <View style={styles.statsGrid}>
          {[
            ["52w Hoog", `$${quote.high52w.toFixed(2)}`],
            ["52w Laag", `$${quote.low52w.toFixed(2)}`],
            ["P/E Ratio", quote.pe > 0 ? quote.pe.toFixed(1) : "N/A"],
            ["Marktcap", quote.marketCap > 1e12 ? `$${(quote.marketCap / 1e12).toFixed(1)}T` : quote.marketCap > 1e9 ? `$${(quote.marketCap / 1e9).toFixed(0)}B` : "N/A"],
            ["Volume", quote.volume > 1e6 ? `${(quote.volume / 1e6).toFixed(1)}M` : quote.volume.toLocaleString()],
            ["EUR/USD", (1 / quote.eurRate).toFixed(4)],
          ].map(([label, value]) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Technical indicators */}
      {indicators && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Technische Indicatoren</Text>
          <View style={styles.statsGrid}>
            {[
              ["RSI", indicators.rsi.toFixed(1), indicators.rsi < 30 ? colors.gain : indicators.rsi > 70 ? colors.loss : colors.textDim],
              ["MACD", indicators.macd.value.toFixed(3), indicators.macd.value > 0 ? colors.gain : colors.loss],
              ["MACD Hist.", indicators.macd.histogram.toFixed(3), indicators.macd.histogram > 0 ? colors.gain : colors.loss],
              ["SMA 20", `$${indicators.sma20.toFixed(0)}`, quote.price > indicators.sma20 ? colors.gain : colors.loss],
              ["SMA 50", `$${indicators.sma50.toFixed(0)}`, quote.price > indicators.sma50 ? colors.gain : colors.loss],
              ["Stoch %K", indicators.stochastic.k.toFixed(1), indicators.stochastic.k < 20 ? colors.gain : indicators.stochastic.k > 80 ? colors.loss : colors.textDim],
            ].map(([label, value, color]) => (
              <View key={label as string} style={styles.statItem}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={[styles.statValue, { color: color as string }]}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI Analysis button */}
      {!aiAnalysis ? (
        <TouchableOpacity
          style={[styles.aiBtn, aiLoading && { opacity: 0.7 }]}
          onPress={handleAIAnalyze}
          disabled={aiLoading}
        >
          <Text style={styles.aiBtnText}>
            {aiLoading ? "🤖 Claude analyseert..." : "🤖 Claude AI Analyse"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.card}>
          <View style={styles.aiHeader}>
            <Text style={styles.cardTitle}>Claude AI Analyse</Text>
            <View style={[styles.sentimentBadge, { backgroundColor: `${sentimentColor}22`, borderColor: `${sentimentColor}55` }]}>
              <Text style={[styles.sentimentText, { color: sentimentColor }]}>{aiAnalysis.sentiment}</Text>
            </View>
            <Text style={styles.confidenceText}>{aiAnalysis.confidenceScore}% vertrouwen</Text>
          </View>

          <Text style={styles.aiSummary}>{aiAnalysis.summary}</Text>

          <Text style={styles.aiSectionLabel}>📌 Kernpunten</Text>
          {aiAnalysis.keyPoints.map((p, i) => (
            <Text key={i} style={styles.aiPoint}>• {p}</Text>
          ))}

          <Text style={[styles.aiSectionLabel, { color: colors.gain }]}>✅ Kansen</Text>
          {aiAnalysis.opportunities.map((p, i) => (
            <Text key={i} style={[styles.aiPoint, { color: colors.gain }]}>+ {p}</Text>
          ))}

          <Text style={[styles.aiSectionLabel, { color: colors.loss }]}>⚠️ Risico's</Text>
          {aiAnalysis.risks.map((p, i) => (
            <Text key={i} style={[styles.aiPoint, { color: colors.loss }]}>- {p}</Text>
          ))}

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationLabel}>Aanbeveling</Text>
            <Text style={styles.recommendationText}>{aiAnalysis.recommendation}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginBottom: 12,
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  heroSymbol: { fontSize: 22, fontWeight: "800", color: colors.text },
  heroName: { fontSize: 13, color: colors.textMuted, marginTop: 2, maxWidth: 220 },
  watchlistBtn: { padding: 4 },
  heroPrice: { fontSize: 36, fontWeight: "800", color: colors.text, fontVariant: ["tabular-nums"] },
  heroUsd: { fontSize: 14, color: colors.textMuted, fontVariant: ["tabular-nums"], marginTop: 2 },
  heroChange: { fontSize: 18, fontWeight: "700", marginTop: 6 },
  signalRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  scoreText: { fontSize: 12, color: colors.textMuted, fontVariant: ["tabular-nums"] },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 12 },
  periodBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, backgroundColor: colors.surface },
  periodBtnActive: { backgroundColor: colors.primary },
  periodText: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  periodTextActive: { color: "#000" },
  chartPlaceholder: { height: CHART_H, justifyContent: "center", alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap" },
  statItem: { width: "50%", paddingVertical: 8, paddingRight: 8 },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5, marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "600", color: colors.textDim, fontVariant: ["tabular-nums"] },
  aiBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  aiBtnText: { color: "#000", fontWeight: "700", fontSize: 16 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  sentimentBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  sentimentText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  confidenceText: { fontSize: 11, color: colors.textMuted, marginLeft: "auto" },
  aiSummary: { fontSize: 14, color: colors.textDim, lineHeight: 21, marginBottom: 14 },
  aiSectionLabel: { fontSize: 12, fontWeight: "700", color: colors.textDim, marginBottom: 6, marginTop: 10, letterSpacing: 0.3 },
  aiPoint: { fontSize: 13, color: colors.textDim, marginBottom: 4, lineHeight: 18 },
  recommendationBox: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 12,
    marginTop: 14,
  },
  recommendationLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  recommendationText: { fontSize: 14, color: colors.text, fontWeight: "500", lineHeight: 20 },
});
