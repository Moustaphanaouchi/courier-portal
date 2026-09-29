import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        user: { select: { name: true, phone: true } },
        assignedParcels: {
          where: {
            status: "DELIVERED",
            isCodCollected: true,
          },
          select: {
            id: true,
            trackingNumber: true,
            recipientName: true,
            city: true,
            codAmount: true,
            codCurrency: true,
            deliveredAt: true,
            merchant: { select: { companyName: true } },
          },
        },
        dailySettlements: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    return NextResponse.json({ success: true, drivers });
  } catch (error: any) {
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
      const created = await tx.driverSettlement.create({
        data: {
          driverId,
          totalCollectedUsd: totalUsd || 0,
          totalCollectedLbp: totalLbp || 0,
          cashHandedOver: true,
          verifiedByAdmin: true,
          adminNote: adminNote || "Cash verified and deposited at hub counter",
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, settlement });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}