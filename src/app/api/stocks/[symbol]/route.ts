import { NextRequest, NextResponse } from "next/server";
import { getQuote, getEurRate } from "@/lib/yahoo-finance";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();
    const [quote, eurRate] = await Promise.all([getQuote(symbol), getEurRate()]);

    if (!quote) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    return NextResponse.json({ ...quote, eurRate });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stock data" },
      { status: 500 }
    );
  }
}
