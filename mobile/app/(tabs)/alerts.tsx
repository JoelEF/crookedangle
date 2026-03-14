import { useEffect, useState, useCallback } from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  RefreshControl, ActivityIndicator, Modal, TextInput, FlatList, Switch,
} from "react-native";
import { getAlerts, createAlert, deleteAlert, patchAlert, searchStocks, Alert } from "@/lib/api";
import { colors } from "@/lib/colors";

interface SearchResult { symbol: string; name: string; exchange: string }

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  const onRefresh = useCallback(() => { setRefreshing(true); fetchAlerts(); }, [fetchAlerts]);

  useEffect(() => {
    if (searchQuery.length < 1) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      const res = await searchStocks(searchQuery);
      setSearchResults(res);
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  async function handleCreate() {
    if (!selected || !targetPrice) return;
    setSubmitting(true);
    try {
      await createAlert({
        symbol: selected.symbol,
        name: selected.name,
        condition,
        price: parseFloat(targetPrice),
      });
      setShowModal(false);
      setSelected(null); setSearchQuery(""); setTargetPrice("");
      fetchAlerts();
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleToggle(alert: Alert) {
    await patchAlert(alert.id, { active: !alert.active });
    fetchAlerts();
  }

  async function handleReset(id: string) {
    await patchAlert(id, { triggered: false });
    fetchAlerts();
  }

  const triggered = alerts.filter((a) => a.triggered);
  const active = alerts.filter((a) => a.active && !a.triggered);
  const inactive = alerts.filter((a) => !a.active && !a.triggered);

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
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{active.length}</Text>
            <Text style={styles.statLabel}>Actief</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.gain }]}>{triggered.length}</Text>
            <Text style={styles.statLabel}>Getriggerd</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.textMuted }]}>{inactive.length}</Text>
            <Text style={styles.statLabel}>Inactief</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Prijs Alerts</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
            <Text style={styles.addBtnText}>+ Nieuw</Text>
          </TouchableOpacity>
        </View>

        {alerts.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nog geen alerts</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.addBtnText}>+ Alert aanmaken</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Triggered */}
        {triggered.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} onToggle={handleToggle} onReset={handleReset} />
        ))}
        {/* Active */}
        {active.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} onToggle={handleToggle} onReset={handleReset} />
        ))}
        {/* Inactive */}
        {inactive.map((alert) => (
          <AlertCard key={alert.id} alert={alert} onDelete={handleDelete} onToggle={handleToggle} onReset={handleReset} />
        ))}
      </ScrollView>

      {/* Create alert modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nieuwe Alert</Text>
            <TouchableOpacity onPress={() => { setShowModal(false); setSelected(null); setSearchQuery(""); }}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {!selected ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Zoek aandeel..."
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
                    <View style={styles.symbolBadge}>
                      <Text style={styles.symbolBadgeText}>{item.symbol.slice(0, 2)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.symbolText}>{item.symbol}</Text>
                      <Text style={styles.nameText}>{item.name}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.selectedStock}>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolBadgeText}>{selected.symbol.slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.symbolText}>{selected.symbol}</Text>
                  <Text style={styles.nameText}>{selected.name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text style={{ color: colors.textMuted }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Conditie</Text>
              <View style={styles.conditionRow}>
                <TouchableOpacity
                  style={[styles.conditionBtn, condition === "ABOVE" && { backgroundColor: `${colors.gain}22`, borderColor: colors.gain }]}
                  onPress={() => setCondition("ABOVE")}
                >
                  <Text style={[styles.conditionText, { color: condition === "ABOVE" ? colors.gain : colors.textMuted }]}>
                    ↑ Boven prijs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.conditionBtn, condition === "BELOW" && { backgroundColor: `${colors.loss}22`, borderColor: colors.loss }]}
                  onPress={() => setCondition("BELOW")}
                >
                  <Text style={[styles.conditionText, { color: condition === "BELOW" ? colors.loss : colors.textMuted }]}>
                    ↓ Onder prijs
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Doelprijs (USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="decimal-pad"
              />

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? "Aanmaken..." : "Alert aanmaken"}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

function AlertCard({
  alert,
  onDelete,
  onToggle,
  onReset,
}: {
  alert: Alert;
  onDelete: (id: string) => void;
  onToggle: (alert: Alert) => void;
  onReset: (id: string) => void;
}) {
  return (
    <View style={[
      styles.alertCard,
      alert.triggered && { borderColor: `${colors.gain}44`, backgroundColor: `${colors.gain}08` },
      !alert.active && !alert.triggered && { opacity: 0.55 },
    ]}>
      <View style={styles.alertHeader}>
        <View style={styles.symbolBadge}>
          <Text style={styles.symbolBadgeText}>{alert.symbol.slice(0, 2)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.symbolText}>{alert.symbol}</Text>
            {alert.triggered && (
              <View style={styles.triggeredBadge}>
                <Text style={styles.triggeredText}>Getriggerd!</Text>
              </View>
            )}
          </View>
          <Text style={styles.nameText}>{alert.name}</Text>
          <Text style={styles.conditionInfo}>
            <Text style={{ color: alert.condition === "ABOVE" ? colors.gain : colors.loss }}>
              {alert.condition === "ABOVE" ? "↑ Boven" : "↓ Onder"}
            </Text>
            {" $"}{alert.price.toFixed(2)}
            {alert.currentPrice ? ` · Nu: $${alert.currentPrice.toFixed(2)}` : ""}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 8 }}>
          <Switch
            value={alert.active}
            onValueChange={() => onToggle(alert)}
            trackColor={{ false: colors.border, true: `${colors.primary}66` }}
            thumbColor={alert.active ? colors.primary : colors.textMuted}
          />
          {alert.triggered && (
            <TouchableOpacity onPress={() => onReset(alert.id)}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => onDelete(alert.id)}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] },
  statLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 0.5, marginTop: 2 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  addBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#000", fontWeight: "700", fontSize: 13 },
  emptyCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 32, alignItems: "center", gap: 16, marginBottom: 8 },
  emptyText: { color: colors.textMuted, fontSize: 14 },
  alertCard: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 8 },
  alertHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  symbolBadge: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  symbolBadgeText: { fontSize: 12, fontWeight: "800", color: "#000" },
  symbolText: { fontSize: 14, fontWeight: "700", color: colors.text },
  nameText: { fontSize: 11, color: colors.textMuted },
  conditionInfo: { fontSize: 12, color: colors.textDim, marginTop: 2, fontVariant: ["tabular-nums"] },
  triggeredBadge: { backgroundColor: `${colors.gain}22`, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: `${colors.gain}55` },
  triggeredText: { fontSize: 9, color: colors.gain, fontWeight: "700" },
  resetText: { fontSize: 12, color: colors.primary },
  deleteText: { fontSize: 16, color: colors.textMuted },
  modal: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted },
  input: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, padding: 14, fontSize: 15, marginBottom: 12 },
  inputLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  conditionRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  conditionBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 14, alignItems: "center", backgroundColor: colors.card },
  conditionText: { fontSize: 14, fontWeight: "600" },
  searchResult: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  selectedStock: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.primary, marginBottom: 16 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: "center" },
  submitBtnText: { color: "#000", fontWeight: "700", fontSize: 16 },
});
