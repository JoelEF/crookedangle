import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query || query.length < 1) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchStocks(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
