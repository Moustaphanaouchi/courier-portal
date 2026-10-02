export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        user: { select: { name: true, phone: true, email: true } },
        parcels: {
          where: {
            status: "DELIVERED",
          },
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
        },
        payouts: {
          orderBy: { createdAt: "desc" },
          include: {
            parcels: {
              select: { id: true, trackingNumber: true, codAmount: true, codCurrency: true },
            },
          },
        },
      },
    });

    const merchantsWithCalculations = merchants.map((m) => {
      const pendingParcels = m.parcels.filter((p) => !p.isMerchantPaid);
      const paidParcels = m.parcels.filter((p) => p.isMerchantPaid);

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
        settledCount: paidParcels.length,
        grossUsd,
        grossLbp,
        feesUsd,
        netPayableUsd,
        pendingParcels,
        historicalPayouts: m.payouts,
      };
    });

    return NextResponse.json({ success: true, merchants: merchantsWithCalculations });
  } catch (error: any) {
    console.error("Admin payouts GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Disburse funds to merchant, generate official remittance voucher, and flag parcels as settled
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { merchantId, paymentMethod, referenceNumber, parcelIds, grossCodUsd, totalFeesUsd, netPayoutUsd } = body;

    if (!merchantId) {
      return NextResponse.json({ success: false, error: "merchantId is required" }, { status: 400 });
    }

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json({ success: false, error: "No parcels selected for payout" }, { status: 400 });
    }

    const randRef = `REMIT-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const voucherRef = referenceNumber?.trim() || randRef;

    const payout = await prisma.$transaction(async (tx) => {
      // 1. Create the official MerchantPayout record
      const createdPayout = await tx.merchantPayout.create({
        data: {
          merchantId,
          grossCodUsd: Number(grossCodUsd) || 0,
          totalFeesUsd: Number(totalFeesUsd) || 0,
          netPayoutUsd: Number(netPayoutUsd) || 0,
          paymentMethod: paymentMethod || "CASH_COUNTER",
          referenceNumber: voucherRef,
          isSettled: true,
        },
      });

      // 2. Link all parcels to this payout voucher and flag as paid
      await tx.parcel.updateMany({
        where: { id: { in: parcelIds } },
        data: {
          payoutId: createdPayout.id,
          isMerchantPaid: true,
        },
      });

      return createdPayout;
    });

    return NextResponse.json({ success: true, payout });
  } catch (error: any) {
    console.error("Admin payouts POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}