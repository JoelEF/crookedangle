import { useEffect, useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Modal, TextInput, FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { getWatchlist, addToWatchlist, removeFromWatchlist, searchStocks, WatchlistItem } from "@/lib/api";
import { colors } from "@/lib/colors";
import PnlText from "@/components/ui/PnlText";

interface SearchResult { symbol: string; name: string; exchange: string }

export default function WatchlistScreen() {
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const fetchWatchlist = useCallback(async () => {
    try {
      const data = await getWatchlist();
      setItems(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchWatchlist(); }, [fetchWatchlist]);

  useEffect(() => {
    if (searchQuery.length < 1) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchStocks(searchQuery);
      setSearchResults(res);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function handleAdd(item: SearchResult) {
    await addToWatchlist(item.symbol, item.name);
    setShowModal(false);
    setSearchQuery("");
    setSearchResults([]);
    fetchWatchlist();
  }

  async function handleRemove(symbol: string) {
    await removeFromWatchlist(symbol);
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  }

  const topGainer = [...items].sort((a, b) => b.changePercent - a.changePercent)[0];
  const topLoser = [...items].sort((a, b) => a.changePercent - b.changePercent)[0];

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
        {/* Top stats */}
        {items.length > 0 && (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: `${colors.gain}33` }]}>
              <Text style={[styles.statLabel, { color: colors.gain }]}>Top stijger</Text>
              <Text style={styles.statSymbol}>{topGainer?.symbol}</Text>
              <PnlText value={topGainer?.changePercent ?? 0} style={{ fontSize: 15, fontWeight: "800" }} />
            </View>
            <View style={[styles.statCard, { borderColor: `${colors.loss}33` }]}>
              <Text style={[styles.statLabel, { color: colors.loss }]}>Top daler</Text>
              <Text style={styles.statSymbol}>{topLoser?.symbol}</Text>
              <PnlText value={topLoser?.changePercent ?? 0} style={{ fontSize: 15, fontWeight: "800" }} />
            </View>
          </View>
        )}

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>{items.length} aandelen gevolgd</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ Toevoegen</Text>
          </TouchableOpacity>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Watchlist is leeg</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ Aandeel toevoegen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemMain}
                onPress={() => router.push(`/stocks/${item.symbol}`)}
                activeOpacity={0.75}
              >
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolBadgeText}>{item.symbol.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                  <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.priceText}>€{item.priceEur.toFixed(2)}</Text>
                  <PnlText value={item.changePercent} style={{ fontSize: 13 }} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.symbol)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Aandeel toevoegen</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); setSearchQuery(""); setSearchResults([]); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Zoek op naam of symbool..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.searchResult} onPress={() => handleAdd(item)}>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolBadgeText}>{item.symbol.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                  <Text style={styles.nameText}>{item.name} · {item.exchange}</Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 20 }}>+</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  statLabel: { fontSize: 10, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  statSymbol: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  addBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 13 },
  emptyCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 32, alignItems: "center", gap: 16 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  itemMain: { flex: 1, flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  removeBtn: { paddingHorizontal: 14, paddingVertical: 20 },
  removeBtnText: { color: colors.textMuted, fontSize: 16 },
  symbolBadge: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  symbolBadgeText: { fontSize: 12, fontWeight: "800", color: "#000" },
  symbolText: { fontSize: 14, fontWeight: "700", color: colors.text },
  nameText: { fontSize: 11, color: colors.textMuted },
  priceText: { fontSize: 15, fontWeight: "700", color: colors.text, fontVariant: ["tabular-nums"] },
  modal: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted },
  input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 14, fontSize: 15, marginBottom: 12 },
  searchResult: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
});
