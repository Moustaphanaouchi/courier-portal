import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ success: false, error: "Tracking number required" }, { status: 400 });
    }

    const parcel = await prisma.parcel.findUnique({
      where: { trackingNumber: code.trim().toUpperCase() },
      select: {
        trackingNumber: true,
        status: true,
        recipientName: true,
        city: true,
        governorate: true,
        codAmount: true,
        codCurrency: true,
        createdAt: true,
        updatedAt: true,
        deliveredAt: true,
        merchant: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!parcel) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, parcel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}