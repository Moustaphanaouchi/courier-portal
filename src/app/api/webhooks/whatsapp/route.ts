import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOutForDeliveryWhatsApp } from "@/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { parcelIds } = await req.json();

    if (!Array.isArray(parcelIds) || parcelIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "parcelIds array is required" },
        { status: 400 }
      );
    }

    const parcels = await prisma.parcel.findMany({
      where: { id: { in: parcelIds } },
      include: {
        merchant: { select: { companyName: true } },
      },
    });

    const results = [];

    for (const parcel of parcels) {
      const sendResult = await sendOutForDeliveryWhatsApp({
          recipientName: parcel.recipientName,
          recipientPhone: parcel.recipientPhone,
          trackingNumber: parcel.trackingNumber,
          driverName: (parcel as any).driver?.user?.name || "Cedex Courier",
          driverPhone: (parcel as any).driver?.user?.phone || "+961 3 448 482",
          codAmount: Number(parcel.codAmount),
          codCurrency: parcel.codCurrency as "USD" | "LBP",
        });

      results.push({
        parcelId: parcel.id,
        trackingNumber: parcel.trackingNumber,
        phone: parcel.recipientPhone,
        result: sendResult,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}