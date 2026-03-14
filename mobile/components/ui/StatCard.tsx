import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/lib/colors";

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  subValue,
  change,
  accentColor = colors.primary,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subValue ? <Text style={styles.subValue}>{subValue}</Text> : null}
      {change !== undefined && (
        <Text style={[styles.change, { color: isPositive ? colors.gain : colors.loss }]}>
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 4,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  subValue: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  change: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
});
