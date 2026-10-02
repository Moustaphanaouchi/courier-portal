export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const payout = await prisma.merchantPayout.findUnique({
      where: { id },
      include: {
        merchant: {
          include: {
            user: { select: { name: true, phone: true, email: true } },
          },
        },
        parcels: {
          select: {
            id: true,
            trackingNumber: true,
            recipientName: true,
            city: true,
            codAmount: true,
            codCurrency: true,
            deliveryFee: true,
            deliveredAt: true,
          },
          orderBy: { deliveredAt: "desc" },
        },
      },
    });

    if (!payout) {
      return NextResponse.json({ success: false, error: "Voucher not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, payout });
  } catch (error: any) {
    console.error("Payout detail error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}