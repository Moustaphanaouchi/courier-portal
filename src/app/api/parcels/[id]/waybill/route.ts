import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, error: "Identifier required" }, { status: 400 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Tenant Isolation: If caller is a merchant, restrict to their own merchantId
    const merchantFilter = session.role === "MERCHANT" 
      ? { merchantId: session.merchantId || "NO_ACCESS" } 
      : {};

    const rawParcel = await prisma.parcel.findFirst({
      where: {
        OR: [
          { id },
          { trackingNumber: id.toUpperCase() },
        ],
        ...merchantFilter,
      },
      include: {
        merchant: {
          select: {
            companyName: true,
            pickupAddress: true,
            pickupCity: true,
            user: {
              select: {
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!rawParcel) {
      return NextResponse.json({ success: false, error: "Shipment not found" }, { status: 404 });
    }

    const parcel = {
      ...rawParcel,
      merchant: {
        companyName: rawParcel.merchant.companyName,
        pickupAddress: rawParcel.merchant.pickupAddress,
        pickupCity: rawParcel.merchant.pickupCity,
        contactPhone: rawParcel.merchant.user?.phone || "+961 3 448 482",
      },
    };

    return NextResponse.json({ success: true, parcel });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}