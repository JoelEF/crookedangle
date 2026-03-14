import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getQuote } from "@/lib/yahoo-finance";

export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Check each alert against current price
    const alertsWithStatus = await Promise.all(
      alerts.map(async (alert) => {
        if (!alert.active || alert.triggered) return alert;

        const quote = await getQuote(alert.symbol);
        if (!quote) return alert;

        const currentPrice = quote.price;
        const isTriggered =
          (alert.condition === "ABOVE" && currentPrice >= alert.price) ||
          (alert.condition === "BELOW" && currentPrice <= alert.price);

        if (isTriggered && !alert.triggered) {
          await prisma.alert.update({
            where: { id: alert.id },
            data: { triggered: true },
          });
          return { ...alert, triggered: true, currentPrice };
        }

        return { ...alert, currentPrice };
      })
    );

    return NextResponse.json(alertsWithStatus);
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, condition, price } = body;

    if (!symbol || !condition || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const alert = await prisma.alert.create({
      data: {
        symbol: symbol.toUpperCase(),
        name: name || symbol.toUpperCase(),
        condition,
        price,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
