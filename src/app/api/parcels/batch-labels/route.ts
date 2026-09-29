import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const { parcelIds } = body || {};

    let whereClause: any = {};

    if (Array.isArray(parcelIds) && parcelIds.length > 0) {
      whereClause.id = { in: parcelIds };
    } else {
      whereClause.status = {
        in: ["READY_FOR_PICKUP", "PICKED_UP", "AT_HUB", "OUT_FOR_DELIVERY", "DELIVERED"],
      };
    }

    // Strict Tenant Isolation: Merchants can ONLY print labels for their own parcels
    if (session.role === "MERCHANT") {
      if (!session.merchantId) {
        return NextResponse.json({ success: false, error: "No merchant profile found" }, { status: 403 });
      }
      whereClause.merchantId = session.merchantId;
    } else if ((session.role as string) !== "COURIER_ADMIN" && (session.role as string) !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const rawParcels = await prisma.parcel.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json({ success: true, parcels: rawParcels });
  } catch (err: any) {
    console.error("Batch labels error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
