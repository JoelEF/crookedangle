import { useEffect, useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { getStockQuote, getStockHistory, TechnicalIndicators } from "@/lib/api";
import { colors, SIGNAL_COLORS, SIGNAL_LABELS } from "@/lib/colors";
import SignalBadge from "@/components/ui/SignalBadge";
import PnlText from "@/components/ui/PnlText";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AMD", "ASML", "ADBE"];

interface SignalRow {
  symbol: string;
  name: string;
  priceEur: number;
  changePercent: number;
  indicators: TechnicalIndicators;
}

export default function SignalsScreen() {
  const router = useRouter();
  const [signals, setSignals] = useState<SignalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState("");
  const [symbols, setSymbols] = useState(DEFAULT_SYMBOLS);
  const [newSymbol, setNewSymbol] = useState("");
  const [filter, setFilter] = useState<string>("ALL");

  const fetchSignals = useCallback(async (symList: string[]) => {
    const results: SignalRow[] = [];
    for (const sym of symList) {
      setLoadingSymbol(sym);
      try {
        const [quote, hist] = await Promise.all([
          getStockQuote(sym),
          getStockHistory(sym, "3mo"),
        ]);
        if (quote && hist.indicators) {
          results.push({
            symbol: sym,
            name: quote.name,
            priceEur: quote.price * quote.eurRate,
            changePercent: quote.changePercent,
            indicators: hist.indicators,
          });
        }
      } catch { /* skip */ }
    }
    results.sort((a, b) => b.indicators.score - a.indicators.score);
    setSignals(results);
    setLoadingSymbol("");
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchSignals(symbols); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSignals(symbols);
  }, [symbols, fetchSignals]);

  function addSymbol() {
    const sym = newSymbol.toUpperCase().trim();
    if (!sym || symbols.includes(sym)) { setNewSymbol(""); return; }
    const updated = [...symbols, sym];
    setSymbols(updated);
    setNewSymbol("");
    fetchSignals(updated);
  }

  const filtered = filter === "ALL" ? signals : signals.filter((s) => s.indicators.signal === filter);

  const counts = {
    STRONG_BUY: signals.filter((s) => s.indicators.signal === "STRONG_BUY").length,
    BUY: signals.filter((s) => s.indicators.signal === "BUY").length,
    NEUTRAL: signals.filter((s) => s.indicators.signal === "NEUTRAL").length,
    SELL: signals.filter((s) => s.indicators.signal === "SELL").length,
    STRONG_SELL: signals.filter((s) => s.indicators.signal === "STRONG_SELL").length,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Summary badges */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {Object.entries(counts).map(([signal, count]) => (
          <TouchableOpacity
            key={signal}
            onPress={() => setFilter(filter === signal ? "ALL" : signal)}
            style={[
              styles.filterBadge,
              {
                backgroundColor: filter === signal ? `${SIGNAL_COLORS[signal as keyof typeof SIGNAL_COLORS]}22` : colors.card,
                borderColor: filter === signal ? SIGNAL_COLORS[signal as keyof typeof SIGNAL_COLORS] : colors.border,
              },
            ]}
          >
            <Text style={[styles.filterCount, { color: SIGNAL_COLORS[signal as keyof typeof SIGNAL_COLORS] }]}>
              {count}
            </Text>
            <Text style={styles.filterLabel}>{SIGNAL_LABELS[signal as keyof typeof SIGNAL_LABELS]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Add symbol */}
      <View style={styles.addRow}>
        <TextInput
          style={[styles.addInput, { flex: 1 }]}
          placeholder="Symbool toevoegen (bv. ASML)"
          placeholderTextColor={colors.textMuted}
          value={newSymbol}
          onChangeText={(t) => setNewSymbol(t.toUpperCase())}
          onSubmitEditing={addSymbol}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addSymbol}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Laden: {loadingSymbol}</Text>
        </View>
      )}

      {/* Signal list */}
      {filtered.map((s, i) => (
        <TouchableOpacity
          key={s.symbol}
          style={styles.signalCard}
          onPress={() => router.push(`/stocks/${s.symbol}`)}
          activeOpacity={0.75}
        >
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{i + 1}</Text>
          </View>
          <View style={styles.symbolBadge}>
            <Text style={styles.symbolBadgeText}>{s.symbol.slice(0, 2)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.symbolText}>{s.symbol}</Text>
            <Text style={styles.nameText} numberOfLines={1}>{s.name}</Text>
            <SignalBadge signal={s.indicators.signal} />
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={styles.priceText}>€{s.priceEur.toFixed(2)}</Text>
            <PnlText value={s.changePercent} style={{ fontSize: 12 }} />
            <View style={styles.scoreRow}>
              <View
                style={[
                  styles.scoreBar,
                  {
                    width: Math.abs(s.indicators.score),
                    backgroundColor: s.indicators.score > 0 ? colors.gain : colors.loss,
                  },
                ]}
              />
              <Text style={[
                styles.scoreText,
                { color: s.indicators.score > 0 ? colors.gain : s.indicators.score < 0 ? colors.loss : colors.textMuted }
              ]}>
                {s.indicators.score > 0 ? "+" : ""}{s.indicators.score}
              </Text>
            </View>
            <Text style={styles.rsiText}>
              RSI {s.indicators.rsi.toFixed(0)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  filterBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    alignItems: "center",
    minWidth: 70,
  },
  filterCount: { fontSize: 20, fontWeight: "800", fontVariant: ["tabular-nums"] },
  filterLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 0.5, marginTop: 2 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  addInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 12,
    fontSize: 14,
  },
  addBtn: { backgroundColor: colors.primary, borderRadius: 12, width: 48, justifyContent: "center", alignItems: "center" },
  addBtnText: { color: "#000", fontSize: 22, fontWeight: "700" },
  loadingBox: { alignItems: "center", padding: 24, gap: 10 },
  loadingText: { color: colors.textMuted, fontSize: 13 },
  signalCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  rankBadge: { paddingTop: 2 },
  rankText: { fontSize: 10, color: colors.textMuted, fontVariant: ["tabular-nums"] },
  symbolBadge: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  symbolBadgeText: { fontSize: 11, fontWeight: "800", color: "#000" },
  symbolText: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 2 },
  nameText: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  priceText: { fontSize: 14, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  scoreBar: { height: 3, borderRadius: 2, maxWidth: 50 },
  scoreText: { fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] },
  rsiText: { fontSize: 10, color: colors.textMuted, fontVariant: ["tabular-nums"] },
});
