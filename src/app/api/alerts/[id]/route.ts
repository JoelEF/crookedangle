import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.alert.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(alert);
  } catch {
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
