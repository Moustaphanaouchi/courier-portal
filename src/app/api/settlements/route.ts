export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        assignedParcels: {
          where: {
            status: "DELIVERED",
          },
          select: {
            id: true,
            trackingNumber: true,
            recipientName: true,
            recipientPhone: true,
            governorate: true,
            city: true,
            codAmount: true,
            codCurrency: true,
            deliveryFee: true,
            deliveredAt: true,
            settlementId: true,
            merchant: { select: { id: true, companyName: true } },
          },
          orderBy: { deliveredAt: "desc" },
        },
        dailySettlements: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    return NextResponse.json({ success: true, drivers });
  } catch (error: any) {
    console.error("Settlement GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { driverId, totalUsd, totalLbp, adminNote, parcelIds } = body;

    if (!driverId) {
      return NextResponse.json({ success: false, error: "driverId is required" }, { status: 400 });
    }

    const settlement = await prisma.$transaction(async (tx) => {
      // 1. Create permanent hub settlement batch
      const created = await tx.driverSettlement.create({
        data: {
          driverId,
          totalCollectedUsd: Number(totalUsd) || 0,
          totalCollectedLbp: Number(totalLbp) || 0,
          cashHandedOver: true,
          verifiedByAdmin: true,
          adminNote: adminNote || "Cash verified and deposited at hub counter",
        },
      });

      // 2. Attach parcels to this settlement
      if (Array.isArray(parcelIds) && parcelIds.length > 0) {
        await tx.parcel.updateMany({
          where: { id: { in: parcelIds } },
          data: {
            settlementId: created.id,
            isCodCollected: true,
          },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, settlement });
  } catch (error: any) {
    console.error("Settlement POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}