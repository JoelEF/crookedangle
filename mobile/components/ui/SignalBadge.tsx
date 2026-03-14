import { View, Text, StyleSheet } from "react-native";
import { SIGNAL_COLORS, SIGNAL_LABELS } from "@/lib/colors";

type Signal = "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";

export default function SignalBadge({ signal }: { signal: Signal }) {
  const color = SIGNAL_COLORS[signal];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55` }]}>
      <Text style={[styles.text, { color }]}>{SIGNAL_LABELS[signal]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
