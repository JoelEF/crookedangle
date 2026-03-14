import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.transaction.deleteMany({ where: { holdingId: params.id } });
    await prisma.holding.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { shares, avgPrice, type } = body;

    const holding = await prisma.holding.findUnique({ where: { id: params.id } });
    if (!holding) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    if (type === "SELL") {
      const newShares = holding.shares - shares;
      if (newShares < 0) {
        return NextResponse.json({ error: "Cannot sell more than you own" }, { status: 400 });
      }

      await prisma.transaction.create({
        data: {
          type: "SELL",
          symbol: holding.symbol,
          shares,
          price: avgPrice,
          total: shares * avgPrice,
          date: new Date(),
          holdingId: params.id,
        },
      });

      if (newShares === 0) {
        await prisma.transaction.deleteMany({ where: { holdingId: params.id } });
        await prisma.holding.delete({ where: { id: params.id } });
        return NextResponse.json({ deleted: true });
      }

      const updated = await prisma.holding.update({
        where: { id: params.id },
        data: { shares: newShares },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.holding.update({
      where: { id: params.id },
      data: { shares, avgPrice },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update holding" }, { status: 500 });
  }
}
