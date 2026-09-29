import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOutForDeliveryWhatsApp } from "@/lib/whatsapp";

// GET: Fetch unassigned / ready parcels and active drivers
export async function GET() {
  try {
    const [parcels, drivers] = await Promise.all([
      prisma.parcel.findMany({
        where: {
          status: { in: ["READY_FOR_PICKUP", "PICKED_UP", "AT_HUB"] },
        },
        orderBy: { createdAt: "desc" },
        include: {
          merchant: { select: { companyName: true, pickupCity: true } },
          driver: { select: { user: { select: { name: true } } } },
        },
      }),
      prisma.driver.findMany({
        where: { isActive: true },
        include: {
          user: { select: { name: true, phone: true } },
        },
      }),
    ]);

    return NextResponse.json({ success: true, parcels, drivers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Assign parcels to driver, set OUT_FOR_DELIVERY, and fire WhatsApp notifications
export async function PATCH(req: Request) {
  try {
    const { parcelIds, driverId } = await req.json();

    const driver = driverId ? await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: { select: { name: true, phone: true } } }
    }) : null;

    if (!Array.isArray(parcelIds) || parcelIds.length === 0 || !driverId) {
      return NextResponse.json(
        { success: false, error: "parcelIds array and driverId are required" },
        { status: 400 }
      );
    }

    // 1. Update statuses to OUT_FOR_DELIVERY
    const updated = await prisma.parcel.updateMany({
      where: { id: { in: parcelIds } },
      data: {
        driverId,
        status: "OUT_FOR_DELIVERY",
      },
    });

    // 2. Fetch parcel & merchant metadata for notification dispatch
    const parcelsToNotify = await prisma.parcel.findMany({
      where: { id: { in: parcelIds } },
      include: {
        merchant: { select: { companyName: true } },
      },
    });

    // 3. Dispatch WhatsApp notifications concurrently
    const notifications = await Promise.allSettled(
      parcelsToNotify.map((p) =>
        sendOutForDeliveryWhatsApp({
            recipientName: p.recipientName,
            recipientPhone: p.recipientPhone,
            trackingNumber: p.trackingNumber,
            driverName: driver?.user?.name || "Cedex Courier",
            driverPhone: driver?.user?.phone || "+961 3 448 482",
            codAmount: Number(p.codAmount),
            codCurrency: p.codCurrency as "USD" | "LBP",
          })
      )
    );

    const successfulNotifs = notifications.filter(
      (n) => n.status === "fulfilled" && n.value.success
    ).length;

    return NextResponse.json({
      success: true,
      count: updated.count,
      whatsappNotified: successfulNotifs,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}