import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getQuote, getEurRate } from "@/lib/yahoo-finance";

export async function GET() {
  try {
    const holdings = await prisma.holding.findMany({
      include: { transactions: true },
      orderBy: { createdAt: "desc" },
    });

    const eurRate = await getEurRate();

    const portfolioData = await Promise.all(
      holdings.map(async (holding) => {
        const quote = await getQuote(holding.symbol);
        const currentPrice = quote?.price || holding.avgPrice;
        const currentValue = currentPrice * holding.shares;
        const costBasis = holding.avgPrice * holding.shares;
        const pnl = currentValue - costBasis;
        const pnlPercent = ((currentValue - costBasis) / costBasis) * 100;

        return {
          ...holding,
          currentPrice,
          currentValue,
          currentValueEur: currentValue * eurRate,
          costBasis,
          pnl,
          pnlPercent,
          change: quote?.change || 0,
          changePercent: quote?.changePercent || 0,
          eurRate,
        };
      })
    );

    const totalValue = portfolioData.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = portfolioData.reduce((sum, h) => sum + h.costBasis, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    return NextResponse.json({
      holdings: portfolioData,
      summary: {
        totalValue,
        totalValueEur: totalValue * eurRate,
        totalCost,
        totalPnl,
        totalPnlPercent,
        eurRate,
      },
    });
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, shares, avgPrice, date } = body;

    if (!symbol || !name || !shares || !avgPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if holding already exists
    const existing = await prisma.holding.findFirst({
      where: { symbol: symbol.toUpperCase() },
    });

    let holding;
    if (existing) {
      // Update existing - calculate new avg price
      const totalShares = existing.shares + shares;
      const newAvgPrice =
        (existing.shares * existing.avgPrice + shares * avgPrice) / totalShares;

      holding = await prisma.holding.update({
        where: { id: existing.id },
        data: { shares: totalShares, avgPrice: newAvgPrice },
      });
    } else {
      holding = await prisma.holding.create({
        data: {
          symbol: symbol.toUpperCase(),
          name,
          shares,
          avgPrice,
        },
      });
    }

    // Log transaction
    await prisma.transaction.create({
      data: {
        type: "BUY",
        symbol: symbol.toUpperCase(),
        shares,
        price: avgPrice,
        total: shares * avgPrice,
        date: date ? new Date(date) : new Date(),
        holdingId: holding.id,
      },
    });

    return NextResponse.json(holding, { status: 201 });
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
  }
}
