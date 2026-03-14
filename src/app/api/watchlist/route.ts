import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getQuote, getEurRate } from "@/lib/yahoo-finance";

export async function GET() {
  try {
    const watchlist = await prisma.watchlist.findMany({
      orderBy: { addedAt: "desc" },
    });

    const eurRate = await getEurRate();

    const withPrices = await Promise.all(
      watchlist.map(async (item) => {
        const quote = await getQuote(item.symbol);
        return {
          ...item,
          price: quote?.price || 0,
          priceEur: (quote?.price || 0) * eurRate,
          change: quote?.change || 0,
          changePercent: quote?.changePercent || 0,
        };
      })
    );

    return NextResponse.json(withPrices);
  } catch {
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name } = body;

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const item = await prisma.watchlist.upsert({
      where: { symbol: symbol.toUpperCase() },
      update: {},
      create: {
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    await prisma.watchlist.delete({ where: { symbol: symbol.toUpperCase() } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
