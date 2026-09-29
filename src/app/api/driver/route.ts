import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const driverIdParam = searchParams.get("driverId");

    let driverId = driverIdParam || session?.driverId;

    if (!driverId) {
      const firstDriver = await prisma.driver.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      driverId = firstDriver?.id || null;
    }

    if (!driverId) {
      return NextResponse.json({ success: true, parcels: [] });
    }

    const parcels = await prisma.parcel.findMany({
      where: {
        driverId,
        status: { in: ["OUT_FOR_DELIVERY", "DELIVERED", "FAILED_ATTEMPT", "PICKED_UP"] },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        merchant: { select: { companyName: true, pickupCity: true } },
      },
    });

    return NextResponse.json({ success: true, parcels });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { parcelId, status, notes, collectedCurrency, collectedAmount } = body;

    if (!parcelId || !status) {
      return NextResponse.json(
        { success: false, error: "parcelId and status are required" },
        { status: 400 }
      );
    }

    const isDelivered = status === "DELIVERED";

    const updateData: any = {
      status,
      isCodCollected: isDelivered,
      deliveredAt: isDelivered ? new Date() : null,
      deliveryAttempts: { increment: 1 },
      notes: notes !== undefined ? notes : undefined,
    };

    if (isDelivered && collectedCurrency && collectedAmount !== undefined) {
      updateData.codCurrency = collectedCurrency;
      updateData.codAmount = Number(collectedAmount);
    }

    const updatedParcel = await prisma.parcel.update({
      where: { id: parcelId },
      data: updateData,
    });

    return NextResponse.json({ success: true, parcel: updatedParcel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}