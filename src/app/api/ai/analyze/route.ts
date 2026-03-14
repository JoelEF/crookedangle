import { NextRequest, NextResponse } from "next/server";
import { analyzeStock } from "@/lib/claude-ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      name,
      price,
      changePercent,
      technicalSignal,
      technicalScore,
      rsi,
      pe,
      marketCap,
    } = body;

    if (!symbol || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const analysis = await analyzeStock(
      symbol,
      name,
      price,
      changePercent,
      technicalSignal,
      technicalScore,
      rsi,
      pe,
      marketCap
    );

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze stock" },
      { status: 500 }
    );
  }
}
