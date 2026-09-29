import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      select: {
        id: true,
        companyName: true,
        pickupCity: true,
        user: { select: { name: true, phone: true } },
        parcels: {
          where: {
            status: "DELIVERED",
            isMerchantPaid: false,
          },
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
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const merchantsWithCalculations = merchants.map((m) => {
      const pendingParcels = m.parcels;
      const grossUsd = pendingParcels
        .filter((p) => p.codCurrency === "USD")
        .reduce((sum, p) => sum + Number(p.codAmount), 0);
      const grossLbp = pendingParcels
        .filter((p) => p.codCurrency === "LBP")
        .reduce((sum, p) => sum + Number(p.codAmount), 0);
      const feesUsd = pendingParcels.reduce((sum, p) => sum + Number(p.deliveryFee || 0), 0);
      const netPayableUsd = grossUsd - feesUsd;

      return {
        id: m.id,
        companyName: m.companyName,
        pickupCity: m.pickupCity,
        contactName: m.user?.name || "",
        contactPhone: m.user?.phone || "",
        pendingCount: pendingParcels.length,
        grossUsd,
        grossLbp,
        feesUsd,
        netPayableUsd,
        parcels: pendingParcels,
        recentPayouts: m.payouts,
      };
    });

    return NextResponse.json({ success: true, merchants: merchantsWithCalculations });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}