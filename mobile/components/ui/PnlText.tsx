import { Text, TextStyle } from "react-native";
import { colors } from "@/lib/colors";

interface PnlTextProps {
  value: number;
  suffix?: string;
  prefix?: string;
  style?: TextStyle;
  decimals?: number;
}

export default function PnlText({
  value,
  suffix = "%",
  prefix = "",
  style,
  decimals = 2,
}: PnlTextProps) {
  const isPositive = value >= 0;
  const color = isPositive ? colors.gain : colors.loss;
  const sign = isPositive ? "+" : "";
  return (
    <Text style={[{ color, fontVariant: ["tabular-nums"], fontWeight: "600" }, style]}>
      {sign}{prefix}{Math.abs(value).toFixed(decimals)}{suffix}
    </Text>
  );
}
