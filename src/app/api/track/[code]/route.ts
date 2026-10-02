export const dynamic = "force-dynamic";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Tracking number required" },
        { status: 400 }
      );
    }

    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber: code.trim().toUpperCase() },
      select: {
        trackingNumber: true,
        status: true,
        recipientName: true,
        city: true,
        governorate: true,
        detailedAddress: true,
        codAmount: true,
        codCurrency: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        deliveredAt: true,
        merchant: {
          select: {
            companyName: true,
            pickupCity: true,
          },
        },
        driver: {
          select: {
            vehicleType: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!parcel) {
      return NextResponse.json(
        { success: false, error: "Shipment not found. Please verify your tracking code." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, parcel });
  } catch (error: any) {
    console.error("Track GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
