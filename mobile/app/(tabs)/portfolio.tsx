import { useEffect, useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Modal, TextInput,
  Alert, FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { getPortfolio, addHolding, deleteHolding, searchStocks, Holding } from "@/lib/api";
import { colors } from "@/lib/colors";
import PnlText from "@/components/ui/PnlText";

interface SearchResult { symbol: string; name: string; exchange: string }

export default function PortfolioScreen() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchHoldings = useCallback(async () => {
    try {
      const data = await getPortfolio();
      setHoldings(data.holdings);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHoldings(); }, [fetchHoldings]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchHoldings(); }, [fetchHoldings]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 1) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchStocks(searchQuery);
      setSearchResults(res);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function handleBuy() {
    if (!selected || !shares || !price) return;
    setSubmitting(true);
    try {
      await addHolding({
        symbol: selected.symbol,
        name: selected.name,
        shares: parseFloat(shares),
        avgPrice: parseFloat(price),
      });
      setShowModal(false);
      setSelected(null); setSearchQuery(""); setShares(""); setPrice("");
      fetchHoldings();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(holding: Holding) {
    Alert.alert(
      "Positie verwijderen",
      `Weet je zeker dat je ${holding.symbol} wilt verwijderen?`,
      [
        { text: "Annuleren", style: "cancel" },
        {
          text: "Verwijderen",
          style: "destructive",
          onPress: async () => {
            await deleteHolding(holding.id);
            fetchHoldings();
          },
        },
      ]
    );
  }

  const totalValueEur = holdings.reduce((s, h) => s + h.currentValueEur, 0);
  const totalPnl = holdings.reduce((s, h) => s + h.pnl, 0);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { flex: 1, marginRight: 6 }]}>
            <Text style={styles.summaryLabel}>Waarde (EUR)</Text>
            <Text style={styles.summaryValue}>€{totalValueEur.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryCard, { flex: 1, marginLeft: 6 }]}>
            <Text style={styles.summaryLabel}>P&L</Text>
            <PnlText value={totalPnl} suffix="" prefix="$" style={styles.summaryValue} />
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Posities ({holdings.length})</Text>
          <TouchableOpacity style={styles.buyBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.buyBtnText}>+ Kopen</Text>
          </TouchableOpacity>
        </View>

        {holdings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nog geen posities</Text>
            <TouchableOpacity style={styles.buyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.buyBtnText}>+ Eerste aandeel kopen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          holdings.map((h) => (
            <TouchableOpacity
              key={h.id}
              style={styles.holdingCard}
              onPress={() => router.push(`/stocks/${h.symbol}`)}
              onLongPress={() => handleDelete(h)}
              activeOpacity={0.75}
            >
              <View style={styles.holdingHeader}>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolText}>{h.symbol.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbol}>{h.symbol}</Text>
                  <Text style={styles.name} numberOfLines={1}>{h.name}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.holdingValue}>€{h.currentValueEur.toFixed(2)}</Text>
                  <PnlText value={h.pnlPercent} style={{ fontSize: 13 }} />
                </View>
              </View>
              <View style={styles.holdingDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Aandelen</Text>
                  <Text style={styles.detailValue}>{h.shares.toFixed(4)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Aankoopprijs</Text>
                  <Text style={styles.detailValue}>${h.avgPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Huidige prijs</Text>
                  <Text style={styles.detailValue}>${h.currentPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Dag %</Text>
                  <PnlText value={h.changePercent} style={{ fontSize: 12 }} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Text style={styles.hint}>Houd een positie ingedrukt om te verwijderen</Text>
      </ScrollView>

      {/* Buy modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aandeel kopen</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); setSelected(null); setSearchQuery(""); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {!selected ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Zoek aandeel (bv. AAPL, Apple)"
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.symbol}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResult}
                    onPress={() => { setSelected(item); setSearchResults([]); }}
                  >
                    <View style={[styles.symbolBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.symbolText}>{item.symbol.slice(0, 2)}</Text>
                    </View>
                    <View>
                      <Text style={styles.symbol}>{item.symbol}</Text>
                      <Text style={styles.name}>{item.name} · {item.exchange}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.selectedStock}>
                <View style={[styles.symbolBadge, { width: 44, height: 44, borderRadius: 12 }]}>
                  <Text style={[styles.symbolText, { fontSize: 14 }]}>{selected.symbol.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbol}>{selected.symbol}</Text>
                  <Text style={styles.name}>{selected.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Aantal aandelen</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={shares}
                onChangeText={setShares}
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Aankoopprijs (USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />

              {shares && price && (
                <View style={styles.totalBox}>
                  <Text style={{ color: colors.textMuted }}>Totale investering</Text>
                  <Text style={{ color: colors.text, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                    ${(parseFloat(shares || "0") * parseFloat(price || "0")).toFixed(2)}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleBuy}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>
                  {submitting ? "Bezig..." : "Kopen"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  summaryRow: { flexDirection: "row", marginBottom: 16 },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  summaryLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  buyBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  buyBtnText: { color: "#000", fontWeight: "700", fontSize: 13 },
  emptyCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 32, alignItems: "center", gap: 12 },
  emptyText: { color: colors.textMuted, fontSize: 14, marginBottom: 8 },
  holdingCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    overflow: "hidden",
  },
  holdingHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  holdingValue: { fontSize: 15, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
  holdingDetails: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  detailValue: { fontSize: 12, color: colors.textDim, fontVariant: ["tabular-nums"] },
  hint: { fontSize: 11, color: colors.textMuted, textAlign: "center", marginTop: 8 },
  symbolBadge: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  symbolText: { fontSize: 12, fontWeight: "800", color: "#000" },
  symbol: { fontSize: 14, fontWeight: "700", color: colors.text },
  name: { fontSize: 11, color: colors.textMuted },
  // Modal
  modal: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  searchResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedStock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 20,
  },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: "center" },
  submitBtnText: { color: "#000", fontWeight: "700", fontSize: 16 },
});
