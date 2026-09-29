import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const merchantIdParam = searchParams.get("merchantId");
    let merchantId: string | null = null;

    if (session?.role === "MERCHANT") {
      // STRICT TENANT ISOLATION: Merchants can ONLY query their own account
      merchantId = session.merchantId;
      if (!merchantId) {
        return NextResponse.json({ error: "Merchant profile not found" }, { status: 403 });
      }
    } else if (session?.role === "COURIER_ADMIN") {
      // Hub admins can inspect a requested merchant or fallback to first
      merchantId = merchantIdParam || session.merchantId;
      if (!merchantId) {
        const first = await prisma.merchant.findFirst({ select: { id: true } });
        merchantId = first?.id || null;
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!merchantId) {
      return NextResponse.json({
        success: true,
        summary: {
          pendingGrossUsd: 0,
          pendingGrossLbp: 0,
          pendingFeesUsd: 0,
          netPayableUsd: 0,
          pendingCount: 0,
        },
        deliveredParcels: [],
        historicalPayouts: [],
      });
    }

    const [merchant, deliveredParcels, historicalPayouts] = await Promise.all([
      prisma.merchant.findUnique({
        where: { id: merchantId },
        select: { id: true, companyName: true },
      }),
      prisma.parcel.findMany({
        where: {
          merchantId,
          status: "DELIVERED",
        },
        orderBy: { deliveredAt: "desc" },
        select: {
          id: true,
          trackingNumber: true,
          recipientName: true,
          city: true,
          codAmount: true,
          codCurrency: true,
          deliveryFee: true,
          isMerchantPaid: true,
          deliveredAt: true,
          payoutId: true,
        },
      }),
      prisma.merchantPayout.findMany({
        where: { merchantId },
        orderBy: { createdAt: "desc" },
        include: {
          parcels: {
            select: { id: true, trackingNumber: true, codAmount: true, codCurrency: true },
          },
        },
      }),
    ]);

    const pendingParcels = deliveredParcels.filter((p) => !p.isMerchantPaid);

    const pendingGrossUsd = pendingParcels
      .filter((p) => p.codCurrency === "USD")
      .reduce((sum, p) => sum + Number(p.codAmount), 0);

    const pendingGrossLbp = pendingParcels
      .filter((p) => p.codCurrency === "LBP")
      .reduce((sum, p) => sum + Number(p.codAmount), 0);

    const pendingFeesUsd = pendingParcels.reduce((sum, p) => sum + Number(p.deliveryFee), 0);
    const netPayableUsd = pendingGrossUsd - pendingFeesUsd;

    return NextResponse.json({
      success: true,
      merchant,
      summary: {
        pendingGrossUsd,
        pendingGrossLbp,
        pendingFeesUsd,
        netPayableUsd,
        pendingCount: pendingParcels.length,
      },
      deliveredParcels,
      historicalPayouts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}