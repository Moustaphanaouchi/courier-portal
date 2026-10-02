export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOutForDeliveryWhatsApp } from "@/lib/whatsapp";

// GET: Fetch all dispatchable parcels (ready at hub + currently out for delivery) and active drivers
export async function GET() {
  try {
    const [parcels, drivers] = await Promise.all([
      prisma.parcel.findMany({
        where: {
          status: {
            in: ["READY_FOR_PICKUP", "PICKED_UP", "AT_HUB", "DRAFT", "OUT_FOR_DELIVERY"],
          },
        },
        orderBy: { createdAt: "desc" },
        include: {
          merchant: { select: { id: true, companyName: true, pickupCity: true } },
          driver: { select: { id: true, user: { select: { name: true, phone: true } } } },
        },
      }),
      prisma.driver.findMany({
        where: { isActive: true },
        include: {
          user: { select: { name: true, phone: true, email: true } },
        },
      }),
    ]);

    return NextResponse.json({ success: true, parcels, drivers });
  } catch (error: any) {
    console.error("Dispatch GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Assign parcel(s) to driver, set OUT_FOR_DELIVERY, or reassign
export async function PATCH(req: Request) {
  try {
    const { parcelIds, driverId } = await req.json();

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "parcelIds array is required" },
        { status: 400 }
      );
    }

    if (!driverId) {
      return NextResponse.json(
        { success: false, error: "driverId is required" },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: { select: { name: true, phone: true } } },
    });

    if (!driver) {
      return NextResponse.json({ success: false, error: "Driver not found" }, { status: 404 });
    }

    // Update statuses to OUT_FOR_DELIVERY and set driverId
    const updated = await prisma.parcel.updateMany({
      where: { id: { in: parcelIds } },
      data: {
        driverId,
        status: "OUT_FOR_DELIVERY",
      },
    });

    // Fire WhatsApp notifications concurrently
    try {
      const parcelsToNotify = await prisma.parcel.findMany({
        where: { id: { in: parcelIds } },
      });

      await Promise.allSettled(
        parcelsToNotify.map((p) =>
          sendOutForDeliveryWhatsApp({
            recipientName: p.recipientName,
            recipientPhone: p.recipientPhone,
            trackingNumber: p.trackingNumber,
            driverName: driver.user.name,
            driverPhone: driver.user.phone,
            codAmount: Number(p.codAmount),
            codCurrency: p.codCurrency as "USD" | "LBP",
          })
        )
      );
    } catch (notifErr) {
      console.warn("WhatsApp notification non-fatal error:", notifErr);
    }

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error: any) {
    console.error("Dispatch PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}