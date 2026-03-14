import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo-finance";
import { calculateIndicators } from "@/lib/technical-analysis";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "3mo") as
      | "1mo"
      | "3mo"
      | "6mo"
      | "1y"
      | "2y";

    const historical = await getHistorical(symbol, period);

    if (historical.length === 0) {
      return NextResponse.json({ error: "No historical data" }, { status: 404 });
    }

    const closes = historical.map((h) => h.close);
    const highs = historical.map((h) => h.high);
    const lows = historical.map((h) => h.low);
    const indicators = calculateIndicators(closes, highs, lows);

    return NextResponse.json({ historical, indicators });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 }
    );
  }
}
