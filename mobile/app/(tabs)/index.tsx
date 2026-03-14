import { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getPortfolio, getWatchlist, PortfolioResponse, WatchlistItem } from "@/lib/api";
import { colors } from "@/lib/colors";
import StatCard from "@/components/ui/StatCard";
import PnlText from "@/components/ui/PnlText";

export default function DashboardScreen() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [p, w] = await Promise.all([getPortfolio(), getWatchlist()]);
      setPortfolio(p);
      setWatchlist(w);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const { summary, holdings } = portfolio ?? { summary: null, holdings: [] };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Hero card */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TOTALE PORTFOLIOWAARDE</Text>
        <Text style={styles.heroValue}>
          €{(summary?.totalValueEur ?? 0).toFixed(2)}
        </Text>
        <Text style={styles.heroSub}>
          ${(summary?.totalValue ?? 0).toFixed(2)} USD
        </Text>
        {summary && (
          <PnlText
            value={summary.totalPnlPercent}
            style={styles.heroChange}
          />
        )}
      </View>

      {/* Stats row */}
      <View style={styles.row}>
        <StatCard
          label="P&L"
          value={`€${Math.abs((summary?.totalPnl ?? 0) * (summary?.eurRate ?? 0.92)).toFixed(0)}`}
          change={summary?.totalPnlPercent}
          accentColor={
            (summary?.totalPnl ?? 0) >= 0 ? colors.gain : colors.loss
          }
        />
        <StatCard
          label="Posities"
          value={holdings.length.toString()}
          subValue={`1 USD = €${(summary?.eurRate ?? 0.92).toFixed(4)}`}
          accentColor={colors.warning}
        />
      </View>

      {/* Holdings */}
      <Text style={styles.sectionTitle}>Mijn Posities</Text>
      {holdings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nog geen posities</Text>
          <Text style={styles.emptyHint}>Ga naar Portfolio → Kopen</Text>
        </View>
      ) : (
        <View style={styles.card}>
          {holdings.map((h, i) => (
            <TouchableOpacity
              key={h.id}
              style={[styles.holdingRow, i < holdings.length - 1 && styles.rowBorder]}
              onPress={() => router.push(`/stocks/${h.symbol}`)}
              activeOpacity={0.7}
            >
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolBadgeText}>
                  {h.symbol.slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.symbolText}>{h.symbol}</Text>
                <Text style={styles.nameText} numberOfLines={1}>{h.name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.valueText}>
                  €{h.currentValueEur.toFixed(2)}
                </Text>
                <PnlText value={h.pnlPercent} style={{ fontSize: 12 }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Watchlist */}
      <Text style={styles.sectionTitle}>Watchlist</Text>
      {watchlist.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Geen aandelen gevolgd</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {watchlist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.watchCard}
              onPress={() => router.push(`/stocks/${item.symbol}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.watchSymbol}>{item.symbol}</Text>
              <Text style={styles.watchPrice}>€{item.priceEur.toFixed(2)}</Text>
              <PnlText value={item.changePercent} style={{ fontSize: 12 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    padding: 24,
    marginBottom: 12,
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  heroSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  heroChange: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  row: { flexDirection: "row", marginBottom: 20, marginHorizontal: -4 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 8,
  },
  holdingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  symbolBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  symbolBadgeText: { fontSize: 12, fontWeight: "800", color: "#000" },
  symbolText: { fontSize: 14, fontWeight: "700", color: colors.text },
  nameText: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  emptyHint: { color: colors.textDim, fontSize: 12, marginTop: 4 },
  horizontalScroll: { marginBottom: 8 },
  watchCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginRight: 10,
    minWidth: 110,
  },
  watchSymbol: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 4 },
  watchPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    fontVariant: ["tabular-nums"],
    marginBottom: 2,
  },
});
